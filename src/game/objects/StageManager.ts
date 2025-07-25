import stagesData from "../data/stages.json";
import { Stage, StepType } from "../objects/objects";

export class StageManager {
  private static _instance: StageManager;
  private _stages: Stage[] | null = null;

  private constructor() {}

  static get instance(): StageManager {
    if (!this._instance) {
      this._instance = new StageManager();
    }
    return this._instance;
  }

  get stages() {
    if (!this._stages) {
      this._stages = this.loadStageData();
    }
    return this._stages;
  }

  private loadStageData(): Stage[] {
    return stagesData.map((stage) => ({
      ...stage,
      steps: stage.steps.map((step) => {
        const formattedType = step.type.charAt(0).toUpperCase() + step.type.slice(1).toLowerCase();

        return {
          ...step,
          type: StepType[formattedType as keyof typeof StepType],
        };
      }),
    }));
  }

  getTotalStepCount(): number {
    return this.stages.reduce((total, stage) => total + stage.steps.length, 0);
  }
}
