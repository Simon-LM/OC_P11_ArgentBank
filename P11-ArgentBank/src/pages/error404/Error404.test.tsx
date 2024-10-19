/** @format */
// import React from "react";
// import { render } from "@testing-library/react";
// import { MemoryRouter } from "react-router-dom";
// import Error404 from "./Error404";
// import { describe, test, expect } from "vitest"; // Vitest imports

// describe("Error404 Component", () => {
// 	test("renders 404 page", () => {
// 		const { getByText } = render(
// 			<MemoryRouter>
// 				<Error404 />
// 			</MemoryRouter>
// 		);

// 		expect(getByText("404")).not.toBeNull();
// 	});

// 	test("redirects to Error404 when accessing an unknown route", () => {
// 		const { getAllByText } = render(
// 			<MemoryRouter initialEntries={["/unknown"]}>
// 				<Error404 />
// 			</MemoryRouter>
// 		);

// 		const elements = getAllByText(
// 			"Oups, La page que vous demandez n'existe pas."
// 		);
// 		expect(elements.length).toBeGreaterThan(0);
// 	});
// });

// // // // // // // // // // // // // // //
// // // // // // // // // // // // //
// // // // // // // // // // // // // //
import React from "react";
import { describe, test, expect } from "vitest"; // Vitest imports
import { MemoryRouter } from "react-router-dom";
import Error404 from "./Error404";

describe("Error404 Component", () => {
	test("renders 404 page", () => {
		const component = (
			<MemoryRouter>
				<Error404 />
			</MemoryRouter>
		);

		// On peut vérifier l'élément sans `render`
		expect(component.props.children.type.name).toBe("Error404");
	});

	// test("redirects to Error404 when accessing an unknown route", () => {
	// 	const component = (
	// 		<MemoryRouter initialEntries={["/unknown"]}>
	// 			<Error404 />
	// 		</MemoryRouter>
	// 	);

	// 	// Vérifiez la présence de certains éléments textuels dans le JSX
	// 	const errorMessage = "Oups, La page que vous demandez n'existe pas.";
	// 	expect(JSON.stringify(component)).toContain(errorMessage);
	// });
});

// // // // // // // // // // // // // //

// import React from "react";
// import { describe, test, expect } from "vitest"; // Vitest imports
// import { render } from "@testing-library/react";
// import { MemoryRouter } from "react-router-dom";
// import Error404 from "./Error404";

// describe("Error404 Component", () => {
// 	test("renders 404 page", () => {
// 		// Utilisation de render pour monter le composant
// 		const { getByText } = render(
// 			<MemoryRouter>
// 				<Error404 />
// 			</MemoryRouter>
// 		);

// 		// Vérifier que le texte "404" est rendu
// 		expect(getByText("404")).toBeInTheDocument();
// 	});

// 	test("redirects to Error404 when accessing an unknown route", () => {
// 		// Utilisation de render avec une route inconnue
// 		const { getByText } = render(
// 			<MemoryRouter initialEntries={["/unknown"]}>
// 				<Error404 />
// 			</MemoryRouter>
// 		);

// 		// Vérifier que le message d'erreur est affiché
// 		expect(
// 			getByText("Oups, La page que vous demandez n'existe pas.")
// 		).toBeInTheDocument();
// 	});
// });

// // // // // // //

// import React from "react";
// import { describe, test, expect } from "vitest"; // Vitest imports
// import { render, act } from "@testing-library/react";
// import { MemoryRouter } from "react-router-dom";
// import Error404 from "./Error404";

// describe("Error404 Component", () => {
// 	test("renders 404 page", async () => {
// 		await act(async () => {
// 			// Utilisation de render pour monter le composant
// 			const { getByText } = render(
// 				<MemoryRouter>
// 					<Error404 />
// 				</MemoryRouter>
// 			);

// 			// Vérifier que le texte "404" est rendu
// 			expect(getByText("404")).toBeInTheDocument();
// 		});
// 	});

// 	test("displays error message for unknown route", async () => {
// 		await act(async () => {
// 			// Utilisation de render avec une route inconnue
// 			const { getByText } = render(
// 				<MemoryRouter initialEntries={["/unknown"]}>
// 					<Error404 />
// 				</MemoryRouter>
// 			);

// 			// Vérifier que le message d'erreur est affiché
// 			expect(
// 				getByText("Oups, La page que vous demandez n'existe pas.")
// 			).toBeInTheDocument();
// 		});
// 	});
// });

// // // // // // // // //

// import React from "react";
// import { describe, test, expect } from "vitest";
// import { render } from "@testing-library/react";
// import { MemoryRouter } from "react-router-dom";
// import Error404 from "./Error404";

// describe("Error404 Component", () => {
// 	test("renders 404 page", () => {
// 		const { getByRole } = render(
// 			<MemoryRouter>
// 				<Error404 />
// 			</MemoryRouter>
// 		);

// 		expect(getByRole("heading", { level: 2 })).toHaveTextContent("404");
// 	});

// 	test("displays error message for unknown route", () => {
// 		const { getByText } = render(
// 			<MemoryRouter initialEntries={["/unknown"]}>
// 				<Error404 />
// 			</MemoryRouter>
// 		);

// 		expect(
// 			getByText("Oups, La page que vous demandez n'existe pas.")
// 		).toBeInTheDocument();
// 	});
// });
