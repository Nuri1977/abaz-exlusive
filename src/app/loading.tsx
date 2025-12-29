import React from "react";

import Loader16Dots from "@/components/shared/Loader16Dots";

const Loading = () => {
  return (
    <Loader16Dots>
      <p className="py-2 text-2xl text-tertiary">Loading ...</p>
    </Loader16Dots>
  );
};

export default Loading;
