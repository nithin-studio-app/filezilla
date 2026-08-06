// Used by Text for its inline font-family — "Roboto" isn't self-hosted
// here (filezilla's own index.css just uses the system stack), so it
// simply falls through to the system fonts below when unavailable.
export const fontFamily = {
  default:
    'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
};
