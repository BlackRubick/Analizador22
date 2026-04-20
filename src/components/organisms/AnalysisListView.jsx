import React from "react";

export default function AnalysisListView(props) {
  return (
    <section>
      <props.AnalysisList {...props} />
    </section>
  );
}
