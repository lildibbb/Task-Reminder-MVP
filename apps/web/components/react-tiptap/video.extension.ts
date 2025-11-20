import { Node, mergeAttributes } from "@tiptap/core";

export const CustomVideo = Node.create({
  name: "video",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute("src"),
        renderHTML: (attributes) => ({ src: attributes.src }),
      },
      width: {
        default: "100%",
        parseHTML: (element) => element.getAttribute("width") || "100%",
        renderHTML: (attributes) => ({ width: attributes.width }),
      },
      height: {
        default: null,
        parseHTML: (element) => element.getAttribute("height"),
        renderHTML: (attributes) =>
          attributes.height ? { height: attributes.height } : {},
      },
      controls: {
        default: true,
        parseHTML: (element) => element.hasAttribute("controls"),
        renderHTML: (attributes) =>
          attributes.controls ? { controls: "controls" } : {},
      },
      frameborder: {
        default: "0",
        parseHTML: (element) => element.getAttribute("frameborder") || "0",
        renderHTML: (attributes) => ({ frameborder: attributes.frameborder }),
      },
      allowfullscreen: {
        default: true,
        parseHTML: (element) =>
          element.hasAttribute("allowfullscreen") ||
          element.getAttribute("allowfullscreen") === "true",
        renderHTML: (attributes) =>
          attributes.allowfullscreen
            ? { allowfullscreen: "allowfullscreen" }
            : {},
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "iframe[src]",
        getAttrs: (element) => {
          const src = element.getAttribute("src");
          if (src) {
            return {
              src,
              width: element.getAttribute("width") || "100%",
              height: element.getAttribute("height") || null,
              frameborder: element.getAttribute("frameborder") || "0",
              allowfullscreen: element.hasAttribute("allowfullscreen"),
            };
          }
          return false;
        },
      },
      {
        tag: "video[src]",
        getAttrs: (element) => ({
          src: element.getAttribute("src"),
          width: element.getAttribute("width") || "100%",
          height: element.getAttribute("height") || null,
          controls: element.hasAttribute("controls"),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    let { src } = HTMLAttributes;

    // Transform YouTube watch URLs to embed URLs
    if (src && /youtube\.com\/watch\?v=/.test(src)) {
      const videoId = src.match(/v=([^&]+)/)?.[1];
      if (videoId) {
        src = `https://www.youtube.com/embed/${videoId}`; // Strip extra params for reliability
      }
    }

    // Transform Vimeo watch URLs to embed URLs
    if (src && /vimeo\.com\/\d+/.test(src)) {
      const videoId = src.match(/vimeo\.com\/(\d+)/)?.[1];
      if (videoId) {
        src = `https://player.vimeo.com/video/${videoId}`;
      }
    }

    // Check if the source is a direct video file (S3 or common video extensions)
    const isDirectVideoFile =
      src &&
      (/\.(mp4|webm|ogg|mov)$/i.test(src) ||
        src.includes("s3.amazonaws.com") ||
        src.startsWith("blob:"));

    if (isDirectVideoFile) {
      const videoAttributes = {
        src,
        width: HTMLAttributes.width || "100%",
        controls: HTMLAttributes.controls ? "controls" : undefined,
        style: `max-width: 100%; width: ${HTMLAttributes.width || "100%"}; display: block;`,
        ...(HTMLAttributes.height ? { height: HTMLAttributes.height } : {}),
      };
      return ["video", mergeAttributes(videoAttributes)];
    } else if (src) {
      const iframeAttributes = {
        src,
        width: HTMLAttributes.width || "100%",
        height: HTMLAttributes.height || "100%",
        frameborder: HTMLAttributes.frameborder || "0",
        allowfullscreen: HTMLAttributes.allowfullscreen
          ? "allowfullscreen"
          : undefined,
        style:
          "position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;",
      };

      return [
        "div",
        {
          class: "iframe-wrapper",
          style:
            "position: relative; width: 100%; padding-top: 56.25%; max-width: 100%;",
        },
        ["iframe", mergeAttributes(iframeAttributes)],
      ];
    }

    console.warn("CustomVideoNode: Invalid or missing video src:", src);
    return [
      "div",
      {
        class: "video-error",
        style: "color: red; text-align: center; padding: 1rem;",
      },
      `Cannot render video source: ${src || "unknown"}`,
    ];
  },
});
