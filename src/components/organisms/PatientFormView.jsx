import React from "react";

export default function PatientFormView(props) {
  return (
    <section>
      <props.PatientForm {...props} />
    </section>
  );
}
