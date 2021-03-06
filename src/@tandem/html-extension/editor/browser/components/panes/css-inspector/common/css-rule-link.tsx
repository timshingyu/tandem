import React =  require("react");
import { BaseApplicationComponent } from "@tandem/common";
import { SyntheticSourceLink } from "@tandem/editor/browser/components/common";
import { SyntheticHTMLElement } from "@tandem/synthetic-browser";
import { CSSHighlightTargetRuleHintComponent } from "./target-rule-hint";
import { MergedCSSStyleRule } from "@tandem/html-extension/editor/browser/stores";

export class CSSMergedRuleLinkComponent  extends BaseApplicationComponent<{ rule: MergedCSSStyleRule, propertyName: string }, any> {
  render() {
    const { rule, propertyName, children } = this.props;
    const match = rule.getDeclarationMainSourceRule(propertyName);

    return <CSSHighlightTargetRuleHintComponent rule={rule} propertyName={propertyName}>
      <SyntheticSourceLink target={match}>
        <span title={match && (match["selector"] || "style attribute")}>{ children || propertyName }</span>
      </SyntheticSourceLink>
    </CSSHighlightTargetRuleHintComponent>
  }
}