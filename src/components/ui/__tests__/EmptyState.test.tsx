import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Tags } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

describe("EmptyState", () => {
  it("renders a Lucide forwardRef icon component without throwing", () => {
    const html = renderToStaticMarkup(
      createElement(EmptyState, {
        icon: Tags,
        title: "No items",
        description: "Add something",
      })
    );
    expect(html).toContain("No items");
    expect(html).toContain("svg");
  });

  it("renders a pre-created icon element", () => {
    const html = renderToStaticMarkup(
      createElement(EmptyState, {
        icon: createElement(Tags, { className: "h-6 w-6" }),
        title: "Empty",
      })
    );
    expect(html).toContain("Empty");
    expect(html).toContain("svg");
  });
});
