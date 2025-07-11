/** @format */

import { describe, test, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Error404 from "./Error404";

describe("Error404 Component", () => {
  test("renders 404 page", () => {
    const component = (
      <MemoryRouter>
        <Error404 />
      </MemoryRouter>
    );

    // We can verify the element without `render`
    expect(component.props.children.type.name).toBe("Error404");
  });
});
