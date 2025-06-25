/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Capability {
  name: string;
  description: string;
  execute: (params: any) => Promise<any>;
}

export class CapabilityRegistry {
  private static instance: CapabilityRegistry;
  private capabilities = new Map<string, Capability>();

  static getInstance() {
    if (!this.instance) {
      this.instance = new CapabilityRegistry();
    }
    return this.instance;
  }

  register(capability: Capability) {
    this.capabilities.set(capability.name, capability);
  }

  registerAll(capabilities: Capability[]) {
    capabilities.forEach((cap) => this.capabilities.set(cap.name, cap));
  }

  getCapabilities(): Capability[] {
    return Array.from(this.capabilities.values());
  }

  hasCapability(name: string): boolean {
    return this.capabilities.has(name);
  }

  async execute(
    name: string,
    params: any,
    options: {
      ignoreError?: boolean;
    } = {}
  ): Promise<any> {
    console.log("[CapabilityRegistry] execute:", name, "params:", params);
    const capability = this.capabilities.get(name);
    if (!capability && !options.ignoreError) {
      throw new Error(`Capability ${name} not found`);
    }
    return capability?.execute(params);
  }
}


