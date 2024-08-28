import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    h1: ({ children }) => <h1 className="text-3xl">{children}</h1>,
    p: ({ children }) => (
      <p
        style={{
          marginTop: "16px !important",
          marginBottom: "16px !important",
        }}
      >
        {children}
      </p>
    ),
  };
}
