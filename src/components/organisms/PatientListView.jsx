import React from "react";

export default function PatientListView(props) {
  return (
    <section>
      <props.PatientList {...props} />
    </section>
  );
}
