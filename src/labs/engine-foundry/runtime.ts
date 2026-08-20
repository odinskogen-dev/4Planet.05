export type EngineAction = string;

export type EngineStage = {
  id: string;
  primitive: "DISCOVER" | "REASON" | "CREATE" | "EXECUTE" | "VERIFY" | "LEARN";
  handler: string;
  requiresActions?: EngineAction[];
};

export type EngineBlueprint = {
  id: string;
  version: string;
  purpose: string;
  userJob: string;
  stages: EngineStage[];
  authority: {
    allowedActions: EngineAction[];
    explicitHighConsequenceApproval?: boolean;
  };
  output: string;
  learningPolicy: string;
};

export type EngineFailure = {
  code: string;
  stageId?: string;
  message?: string;
  actions?: string[];
};

export type EngineTraceRecord = {
  engineId: string;
  runId: string;
  stageId: string;
  sequence: number;
  status: "STARTED" | "SUCCEEDED" | "FAILED" | "BLOCKED";
  at: string;
  details?: unknown;
};

export type StageResult = {
  ok: boolean;
  working?: Record<string, unknown>;
  output?: unknown;
  warnings?: string[];
  failure?: EngineFailure;
  traceDetails?: unknown;
};

export type StageContext = {
  input: unknown;
  working: Record<string, unknown>;
  output: unknown;
  warnings: string[];
  stage: EngineStage;
  blueprint: EngineBlueprint;
};

export type StageHandler = (context: StageContext) => StageResult | Promise<StageResult>;
export type StageRegistry = Record<string, StageHandler>;

export type EngineRun = {
  ok: boolean;
  status: "SUCCEEDED" | "FAILED" | "BLOCKED";
  output: unknown;
  state: {
    input: unknown;
    working: Record<string, unknown>;
    output: unknown;
    warnings: string[];
    failures: EngineFailure[];
  };
  trace: EngineTraceRecord[];
  blueprint: EngineBlueprint;
};

const FORBIDDEN_BY_DEFAULT = new Set([
  "external_send",
  "payment",
  "production_deploy",
  "canon_write",
  "destructive_write",
  "secret_read",
]);

const assertBlueprint = (condition: unknown, message: string): asserts condition => {
  if (!condition) throw new Error(message);
};

export function validateBlueprint(blueprint: EngineBlueprint, registry: StageRegistry) {
  assertBlueprint(blueprint && typeof blueprint === "object", "Blueprint must be an object");
  assertBlueprint(blueprint.id.trim(), "Blueprint.id is required");
  assertBlueprint(blueprint.version.trim(), "Blueprint.version is required");
  assertBlueprint(blueprint.purpose.trim(), "Blueprint.purpose is required");
  assertBlueprint(blueprint.userJob.trim(), "Blueprint.userJob is required");
  assertBlueprint(blueprint.stages.length > 0, "Blueprint.stages must be non-empty");

  const stageIds = blueprint.stages.map((stage) => stage.id);
  assertBlueprint(new Set(stageIds).size === stageIds.length, "Stage ids must be unique");

  for (const stage of blueprint.stages) {
    assertBlueprint(stage.id.trim(), "Every stage requires an id");
    assertBlueprint(typeof registry[stage.handler] === "function", `Unknown stage handler: ${stage.handler}`);
    for (const action of stage.requiresActions ?? []) {
      assertBlueprint(
        blueprint.authority.allowedActions.includes(action),
        `Stage ${stage.id} requires action '${action}' outside engine authority`,
      );
    }
  }

  for (const action of blueprint.authority.allowedActions) {
    if (FORBIDDEN_BY_DEFAULT.has(action)) {
      assertBlueprint(
        blueprint.authority.explicitHighConsequenceApproval === true,
        `High-consequence action '${action}' requires explicit approval`,
      );
    }
  }
}

const clone = <T,>(value: T): T => structuredClone(value);

export function compileEngine(blueprint: EngineBlueprint, registry: StageRegistry) {
  validateBlueprint(blueprint, registry);
  const compiledBlueprint = clone(blueprint);

  return {
    id: compiledBlueprint.id,
    version: compiledBlueprint.version,
    purpose: compiledBlueprint.purpose,
    blueprint: compiledBlueprint,
    async run(
      input: unknown,
      options: { runId?: string; grantedActions?: string[]; clock?: () => string } = {},
    ): Promise<EngineRun> {
      const clock = options.clock ?? (() => new Date().toISOString());
      const runId = options.runId ?? `${compiledBlueprint.id}:run`;
      const granted = new Set(options.grantedActions ?? []);
      const declared = new Set(compiledBlueprint.authority.allowedActions);
      const trace: EngineTraceRecord[] = [];
      const state = {
        input: clone(input),
        working: {} as Record<string, unknown>,
        output: null as unknown,
        warnings: [] as string[],
        failures: [] as EngineFailure[],
      };
      let sequence = 0;

      const record = (
        stageId: string,
        status: EngineTraceRecord["status"],
        details?: unknown,
      ) => {
        trace.push({
          engineId: compiledBlueprint.id,
          runId,
          stageId,
          sequence: sequence++,
          status,
          at: clock(),
          details,
        });
      };

      record("__run__", "STARTED");

      for (const stage of compiledBlueprint.stages) {
        const required = stage.requiresActions ?? [];
        const undeclared = required.filter((action) => !declared.has(action));
        if (undeclared.length) {
          const failure: EngineFailure = {
            code: "AUTHORITY_DECLARATION_VIOLATION",
            stageId: stage.id,
            actions: undeclared,
          };
          state.failures.push(failure);
          record(stage.id, "FAILED", failure);
          record("__run__", "FAILED", failure);
          return { ok: false, status: "FAILED", output: null, state, trace, blueprint: compiledBlueprint };
        }

        const notGranted = required.filter((action) => !granted.has(action));
        if (notGranted.length) {
          const failure: EngineFailure = {
            code: "RUNTIME_AUTHORITY_BLOCK",
            stageId: stage.id,
            actions: notGranted,
          };
          state.failures.push(failure);
          record(stage.id, "BLOCKED", failure);
          record("__run__", "BLOCKED", failure);
          return { ok: false, status: "BLOCKED", output: null, state, trace, blueprint: compiledBlueprint };
        }

        record(stage.id, "STARTED");
        try {
          const result = await registry[stage.handler]({
            input: state.input,
            working: state.working,
            output: state.output,
            warnings: state.warnings,
            stage,
            blueprint: compiledBlueprint,
          });

          if (!result.ok) {
            const failure = result.failure ?? { code: "STAGE_FAILED", stageId: stage.id };
            state.failures.push(failure);
            record(stage.id, "FAILED", failure);
            record("__run__", "FAILED", failure);
            return { ok: false, status: "FAILED", output: null, state, trace, blueprint: compiledBlueprint };
          }

          if (result.working) Object.assign(state.working, result.working);
          if (result.output !== undefined) state.output = result.output;
          if (result.warnings) state.warnings.push(...result.warnings);
          record(stage.id, "SUCCEEDED", result.traceDetails);
        } catch (error) {
          const failure: EngineFailure = {
            code: "STAGE_EXCEPTION",
            stageId: stage.id,
            message: error instanceof Error ? error.message : String(error),
          };
          state.failures.push(failure);
          record(stage.id, "FAILED", failure);
          record("__run__", "FAILED", failure);
          return { ok: false, status: "FAILED", output: null, state, trace, blueprint: compiledBlueprint };
        }
      }

      record("__run__", "SUCCEEDED");
      return {
        ok: true,
        status: "SUCCEEDED",
        output: state.output,
        state,
        trace,
        blueprint: compiledBlueprint,
      };
    },
  };
}
