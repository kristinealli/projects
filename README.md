# Kristine Johnson — Portfolio

Responsive, data-driven rendered, portfolio built with plain HTML, CSS, and JavaScript.

## Adding projects

Project cards and category filters are generated from [`projects.json`](./projects.json). Add a project object to its `projects` array, using the existing entries as examples. Set its `category` to one of the category IDs in the `categories` array; adding a new category there also creates a matching filter button.

Each project includes a title, category, year, image path and alt text, visual label, metadata label, description paragraphs, tags, and links. Set `"featured": true` to use the wide featured-card layout. Descriptions are arrays of paragraphs, each containing text strings; use an object such as `{ "strong": "highlighted text" }` when part of a paragraph should be bold. Link URLs must use `http` or `https`.

### Project template

Copy this object into the `projects` array in `projects.json`, separating it from neighboring objects with a comma. Replace the example values and keep the JSON syntax valid (double quotes, no comments, and no trailing commas).

```json
{
	"category": "web",
	"featured": false,
	"image": "assets/project-image.png",
	"imageAlt": "Short description of the project image",
	"visualLabel": "SHORT / VISUAL / LABEL",
	"meta": "Project type",
	"year": "2026",
	"title": "Project title",
	"paragraphs": [
		[
			"Description text. Use ",
			{ "strong": "this format for bold text" },
			" when emphasis is needed."
		],
		["Add another paragraph as another array of text segments."]
	],
	"tags": ["HTML", "CSS", "JavaScript"],
	"links": [
		{
			"label": "View project ↗",
			"url": "https://example.com/project"
		},
		{
			"label": "Source code ↗",
			"url": "https://github.com/username/project"
		}
	]
}
```

Use an existing category ID (`ml`, `data`, or `web`), or add a new category object to the `categories` array first. Set `"featured": true` for the wide card layout. For plain, unbolded description text, use a paragraph such as `["Description text."]`.

Because the page fetches `projects.json`, open it through a local web server while developing rather than opening `index.html` directly as a `file://` URL.
