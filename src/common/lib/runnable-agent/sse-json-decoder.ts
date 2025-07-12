import { Observable, OperatorFunction } from "rxjs";
import { mergeMap } from "rxjs/operators";

// 最简洁的 SSE + JSON 解码操作符
export function decodeEventStream(): OperatorFunction<string, unknown> {
  return (source: Observable<string>) =>
    source.pipe(
      mergeMap(chunk => {
        return new Observable<unknown>(subscriber => {
          const lines = chunk.split(/\r?\n/);
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const dataStr = line.slice(5).trim();
            if (!dataStr || dataStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(dataStr);
              subscriber.next(parsed);
            } catch {
              // 不完整，跳过
            }
          }
          subscriber.complete();
        });
      }),
    );
} 