import React from "react";

export default function AnalysisFormView(props) {
  return (
    <section>
      <props.AnalysisForm {...props} />
    </section>
  );
}
