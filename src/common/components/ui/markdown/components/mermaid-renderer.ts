import { BehaviorSubject, Observable, combineLatest, distinctUntilChanged, filter, map, switchMap, of, timer, catchError, tap, merge, delay } from "rxjs";

// 渲染状态枚举
export enum MermaidRenderState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
  FALLBACK = 'fallback'
}

// 渲染结果接口
export interface MermaidRenderResult {
  state: MermaidRenderState;
  svg?: string;
  error?: string;
  chart: string;
}

// 渲染尝试结果接口
interface RenderAttemptResult {
  success: boolean;
  svg?: string;
  error?: string;
  state: MermaidRenderState;
}

// 全局缓存
const mermaidCache = new Map<string, string>();

export class MermaidRenderer {
  private chartSubject = new BehaviorSubject<string>('');
  private stateSubject = new BehaviorSubject<MermaidRenderState>(MermaidRenderState.IDLE);
  private svgSubject = new BehaviorSubject<string>('');
  private errorSubject = new BehaviorSubject<string>('');
  
  // 防抖时间配置
  private readonly DEBOUNCE_TIME_FOR_LOADING = 5000; // 5秒防抖
  private readonly DEBOUNCE_TIME_FOR_ERROR = 20000; // 20秒防抖

  constructor() {
    this.setupRenderPipeline();
  }

  private async initializeMermaid() {
    const mermaid = (await import("mermaid")).default;
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });
  }

  private setupRenderPipeline() {
    this.chartSubject.pipe(
      tap(chart => console.log("[MermaidRenderer][setupRenderPipeline][chartSubject] ", { chart })),
      distinctUntilChanged(),
      filter(chart => chart.length > 0),
      // 立即尝试渲染
      switchMap(chart => 
        this.tryRenderChart(chart).pipe(
          // 根据渲染结果决定是否延迟显示
          switchMap(result => {
            console.log("[MermaidRenderer][setupRenderPipeline][switchMap][tryRenderChart] ", { result });
            
            if (result.success) {
              // 渲染成功，立即返回结果
              return of(result);
            } else {
              // 渲染失败，延迟显示错误（避免闪烁）
              return merge(timer(this.DEBOUNCE_TIME_FOR_LOADING).pipe(
                map(() => ({
                  ...result,
                  state: MermaidRenderState.LOADING
                }))
              ), of(result).pipe(
                delay(this.DEBOUNCE_TIME_FOR_ERROR)
              ));
            }
          }),
          // 处理渲染过程中的错误
          catchError(error => {
            console.error('Mermaid rendering pipeline error:', error);
            return of({
              success: false,
              error: error instanceof Error ? error.message : 'Failed to render chart',
              state: MermaidRenderState.ERROR
            });
          })
        )
      )
    ).subscribe(result => {
      // 统一设置状态
      this.updateState(result);
    });
  }

  private tryRenderChart(chart: string): Observable<RenderAttemptResult> {
    return new Observable(observer => {
      this.renderChart(chart).then(result => {
        console.log("[MermaidRenderer][tryRenderChart][renderChart] ", { result });
        
        observer.next(result);
        observer.complete();
      }).catch(error => {
        observer.next({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to render chart',
          state: MermaidRenderState.ERROR
        });
        observer.complete();
      });
    });
  }

  private async renderChart(chart: string): Promise<RenderAttemptResult> {
    try {
      // 检查缓存
      if (mermaidCache.has(chart)) {
        const cachedSvg = mermaidCache.get(chart)!;
        return {
          success: true,
          svg: cachedSvg,
          state: MermaidRenderState.SUCCESS
        };
      }

      // 验证mermaid语法是否完整
      if (!this.isMermaidComplete(chart)) {
        return {
          success: false,
          state: MermaidRenderState.FALLBACK
        };
      }

      // 异步加载并初始化 mermaid
      const mermaid = (await import("mermaid")).default;
      await this.initializeMermaid();

      // 渲染图表
      const id = `mermaid-${Math.random().toString(36).slice(2)}`;
      const { svg } = await mermaid.render(id, chart);
      
      // 缓存结果
      mermaidCache.set(chart, svg);
      
      return {
        success: true,
        svg,
        state: MermaidRenderState.SUCCESS
      };

    } catch (error) {
      console.error('Mermaid rendering error:', error);
      throw error;
    }
  }

  private updateState(result: RenderAttemptResult) {
    // 设置状态
    this.stateSubject.next(result.state);
    
    // 设置SVG
    if (result.success && result.svg) {
      this.svgSubject.next(result.svg);
    } else {
      this.svgSubject.next('');
    }
    
    // 设置错误信息
    if (result.error) {
      this.errorSubject.next(result.error);
    } else {
      this.errorSubject.next('');
    }
  }

  private isMermaidComplete(chart: string): boolean {
    // 简单的完整性检查
    const lines = chart.trim().split('\n');
    const firstLine = lines[0]?.trim();
    
    // 检查是否有基本的mermaid语法
    if (!firstLine || !['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'gantt', 'pie', 'journey', 'gitgraph'].some(type => firstLine.startsWith(type))) {
      return false;
    }

    // 检查是否有结束标记（可选）
    const lastLine = lines[lines.length - 1]?.trim();
    if (lastLine && lastLine.includes('end')) {
      return true;
    }

    // 如果代码长度足够，认为可能完整
    return chart.length > 50;
  }

  // 公共方法：更新图表内容
  public updateChart(chart: string) {
    this.chartSubject.next(chart);
  }

  // 公共方法：获取渲染结果流
  public getRenderResult(): Observable<MermaidRenderResult> {
    return combineLatest([
      this.stateSubject,
      this.svgSubject,
      this.errorSubject,
      this.chartSubject
    ]).pipe(
      map(([state, svg, error, chart]) => ({
        state,
        svg: state === MermaidRenderState.SUCCESS ? svg : undefined,
        error: state === MermaidRenderState.ERROR ? error : undefined,
        chart
      }))
    );
  }

  // 公共方法：清理资源
  public destroy() {
    this.chartSubject.complete();
    this.stateSubject.complete();
    this.svgSubject.complete();
    this.errorSubject.complete();
  }
} 