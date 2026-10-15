const yearElement = document.getElementById("year");
yearElement.textContent = new Date().getFullYear();

// Cache the containers to receive the generated filters and project cards.
const filterBar = document.querySelector(".filterbar");
const projectGrid = document.querySelector(".projects");

function createElement(tagName, className, text) {
	const element = document.createElement(tagName);
	if (className) element.className = className;
	if (text !== undefined) element.textContent = text;
	return element;
}

function validateProjectData(data) {
	// Ensure filters and cards can be built from the expected JSON structure.
	if (!Array.isArray(data.categories) || !Array.isArray(data.projects)) {
		throw new Error("projects.json must contain categories and projects arrays.");
	}

	const categoryIds = new Set();
	for (const category of data.categories) {
		if (
			typeof category.id !== "string" ||
			typeof category.label !== "string" ||
			categoryIds.has(category.id)
		) {
			throw new Error("Each project category needs a unique id and a label.");
		}
		categoryIds.add(category.id);
	}

	for (const project of data.projects) {
		if (
			typeof project.category !== "string" ||
			!categoryIds.has(project.category) ||
			typeof project.title !== "string" ||
			typeof project.meta !== "string" ||
			typeof project.year !== "string" ||
			typeof project.image !== "string" ||
			typeof project.imageAlt !== "string" ||
			typeof project.visualLabel !== "string" ||
			!Array.isArray(project.paragraphs) ||
			!Array.isArray(project.tags) ||
			!Array.isArray(project.links)
		) {
			throw new Error("A project in projects.json is missing required fields.");
		}
	}
}

function createFilterButton(filter, label, pressed = false) {
	const button = createElement("button", "filter", label);
	button.type = "button";
	button.dataset.filter = filter;
	button.setAttribute("aria-pressed", String(pressed));
	return button;
}

// Allows for selected phrases to be emphasized.
function appendParagraphContent(paragraph, segments) {
	for (const segment of segments) {
		if (typeof segment === "string") {
			paragraph.append(document.createTextNode(segment));
		} else if (segment && typeof segment.strong === "string") {
			paragraph.append(createElement("strong", "", segment.strong));
		} else {
			throw new Error("Project description segments must be text or strong text.");
		}
	}
}

function createProjectCard(project, index) {
	// Note: constructed the card with DOM APIs so project text is treated as text, not HTML.
	const article = createElement(
		"article",
		project.featured ? "project featured" : "project",
	);
	article.dataset.category = project.category;

	const visual = createElement("div", "visual");
	visual.setAttribute("aria-hidden", "true");
	const image = createElement("img", "visual-image");
	image.src = project.image;
	image.alt = project.imageAlt;
	visual.append(image, createElement("span", "visual-label", project.visualLabel));

	const content = createElement("div", "project-content");
	const meta = createElement("div", "project-meta");
	meta.append(
		createElement(
			"span",
			"",
			`${String(index + 1).padStart(2, "0")} — ${project.meta}`,
		),
		createElement("time", "", project.year),
	);

	const title = createElement("h3", "", project.title);
	const description = createElement("div", "project-descriptions");
	for (const segments of project.paragraphs) {
		if (!Array.isArray(segments)) {
			throw new Error(`Descriptions for "${project.title}" must be arrays of text segments.`);
		}
		const paragraph = document.createElement("p");
		appendParagraphContent(paragraph, segments);
		description.append(paragraph);
	}

	const tags = createElement("div", "tags");
	for (const tag of project.tags) {
		if (typeof tag !== "string") {
			throw new Error(`Tags for "${project.title}" must be strings.`);
		}
		tags.append(createElement("span", "", tag));
	}

	const links = createElement("div", "project-links");
	for (const link of project.links) {
		if (
			!link ||
			typeof link.label !== "string" ||
			typeof link.url !== "string"
		) {
			throw new Error(`Links for "${project.title}" need a label and URL.`);
		}
		const url = new URL(link.url, window.location.href);
		if (!["http:", "https:"].includes(url.protocol)) {
			throw new Error(`Link URLs for "${project.title}" must use HTTP or HTTPS.`);
		}
		const anchor = createElement("a", "", link.label);
		anchor.href = url.href;
		anchor.target = "_blank";
		anchor.rel = "noopener noreferrer";
		links.append(anchor);
	}

	content.append(meta, title, description, tags, links);
	article.append(visual, content);
	return article;
}

function renderProjects(data) {
	validateProjectData(data);

	// Create filters from the category list and cards from the project list.
	filterBar.replaceChildren(
		createFilterButton(
			"all",
			`All projects / ${String(data.projects.length).padStart(2, "0")}`,
			true,
		),
		...data.categories.map((category) =>
			createFilterButton(category.id, category.label),
		),
	);
	filterBar.setAttribute("aria-busy", "false");
	projectGrid.replaceChildren(
		...data.projects.map((project, index) => createProjectCard(project, index)),
	);
	projectGrid.setAttribute("aria-busy", "false");

	// Derive the displayed project-year range from the project data.
	const years = data.projects.flatMap((project) =>
		project.year.match(/\b20\d{2}\b/g) ?? [],
	);
	const uniqueYears = [...new Set(years)].sort();
	const rangeLabel = document.getElementById("project-range");
	if (uniqueYears.length > 0) {
		const range =
			uniqueYears.length === 1
				? uniqueYears[0]
				: `${uniqueYears[0]}–${uniqueYears[uniqueYears.length - 1]}`;
		rangeLabel.textContent = `PROJECT INDEX / ${range}`;
	}

	// One delegated handler so every generated filter button works.
	filterBar.addEventListener("click", (event) => {
		const button = event.target.closest("button[data-filter]");
		if (!button || !filterBar.contains(button)) return;

		const selected = button.dataset.filter;
		for (const filterButton of filterBar.querySelectorAll("[data-filter]")) {
			filterButton.setAttribute(
				"aria-pressed",
				String(filterButton === button),
			);
		}
		for (const project of projectGrid.querySelectorAll("[data-category]")) {
			project.hidden =
				selected !== "all" && project.dataset.category !== selected;
		}
	});
}

// Load the editable project data, then render it or report a error.
fetch("projects.json")
	.then((response) => {
		if (!response.ok) {
			throw new Error(`Could not load projects.json (${response.status}).`);
		}
		return response.json();
	})
	.then(renderProjects)
	.catch((error) => {
		console.error("Unable to load portfolio projects.", error);
		filterBar.setAttribute("aria-busy", "false");
		projectGrid.setAttribute("aria-busy", "false");
		projectGrid.setAttribute("role", "alert");
		projectGrid.textContent =
			"Projects could not be loaded. Check that projects.json is valid and available.";
	});
