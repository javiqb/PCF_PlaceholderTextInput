import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class PlaceholderText implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private container!: HTMLDivElement;
  private host!: HTMLDivElement;

  private input!: HTMLInputElement;
  private textarea!: HTMLTextAreaElement;

  private notifyOutputChanged!: () => void;
  private currentValue = "";
  private isMultiline = false;

  public init(
    _context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    _state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this.container = container;
    this.notifyOutputChanged = notifyOutputChanged;

    // Wrapper that draws the field background/border (chrome)
    this.host = document.createElement("div");
    this.host.className = "evidi-field-host";

    // Single line input
    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.className = "evidi-placeholder-input";
    this.input.addEventListener("input", () => {
      this.currentValue = this.input.value;
      this.notifyOutputChanged();
    });

    // Multi line textarea
    this.textarea = document.createElement("textarea");
    this.textarea.className = "evidi-placeholder-textarea";
    this.textarea.addEventListener("input", () => {
      this.currentValue = this.textarea.value;
      this.notifyOutputChanged();
    });

    // Default render
    this.host.appendChild(this.input);
    this.container.appendChild(this.host);
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    const value = context.parameters.value.raw ?? "";

    // If you added the "multiline" input (TwoOptions) in manifest:
    const shouldBeMultiline = context.parameters.multiline?.raw === true;

    // Swap inside host
    if (shouldBeMultiline !== this.isMultiline) {
      this.isMultiline = shouldBeMultiline;
      this.host.replaceChildren(this.isMultiline ? this.textarea : this.input);
    }

    // Placeholder
    const placeholder = context.parameters.placeholder.raw ?? "";
    if (this.isMultiline) this.textarea.placeholder = placeholder;
    else this.input.placeholder = placeholder;

    // Rows for textarea
    if (this.isMultiline) {
      const rows = context.parameters.rows.raw ?? 3;
      this.textarea.rows = Math.max(1, rows);
    }

    // Value + disabled
    this.currentValue = value;
    if (this.isMultiline) {
      if (this.textarea.value !== value) this.textarea.value = value;
      this.textarea.disabled = context.mode.isControlDisabled;
    } else {
      if (this.input.value !== value) this.input.value = value;
      this.input.disabled = context.mode.isControlDisabled;
    }
  }

  public getOutputs(): IOutputs {
    return { value: this.currentValue };
  }

  public destroy(): void {
    this.input?.remove();
    this.textarea?.remove();
    this.host?.remove();
  }
}