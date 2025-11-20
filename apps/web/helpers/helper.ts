// Format timestamp for display
export const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format date for display
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
export function convertBase64ToBlob(base64: string) {
  const arr = base64.split(",");
  const mime = arr[0]?.match(/:(.*?);/)![1];
  const bstr = atob(arr[1]!);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms)); // debugging

type User = {
  name?: string;
  email: string;
};

export function getUserInitialsAndName(user: User) {
  const initials = user.name
    ? user.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
    : (user.email[0]?.toUpperCase() ?? "");

  const emailNamePart = user.email.split("@")[0] ?? "";
  const nameFromEmail = emailNamePart.includes(".")
    ? emailNamePart.split(".")[0]
    : emailNamePart;

  return { initials, nameFromEmail };
}

export function isDefaultEmptyParagraphDoc(doc: any): boolean {
  if (
    !doc ||
    typeof doc !== "object" ||
    doc.type !== "doc" ||
    !Array.isArray(doc.content)
  ) {
    return false;
  }
  if (doc.content.length !== 1) {
    return false;
  }
  const firstNode = doc.content[0];
  if (
    !firstNode ||
    typeof firstNode !== "object" ||
    firstNode.type !== "paragraph"
  ) {
    return false;
  }
  return (
    !firstNode.content ||
    (Array.isArray(firstNode.content) && firstNode.content.length === 0)
  );
}
