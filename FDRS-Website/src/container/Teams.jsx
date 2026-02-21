import React from "react";
import { teamData } from "./data";

export const Teams = () => {
  return (
    <div className="teams">
      {teamData.map((i) => {
        <div className="team">
          <h3>{i.name}</h3>
          <p>{i.des}</p>
          <p>{i.about}</p>
        </div>;
      })}
    </div>
  );
};
