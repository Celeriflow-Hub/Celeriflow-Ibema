export type PublicNoticeSource = {
  protocolNumber: string;
  processTypeName: string;
};

export function createPublicNoticeValidationCode() {
  return `CFN-${crypto.randomUUID().replace(/-/g, "").slice(0, 20).toUpperCase()}`;
}

// Do not add source narrative, interested parties, document identifiers, or blob URLs here.
export function createRedactedProcessNotice(source: PublicNoticeSource) {
  return {
    title: `Aviso de processo ${source.protocolNumber}`,
    category: source.processTypeName,
  };
}

export function projectPublicNotice(notice: {
  title: string;
  category: string;
  publishedAt: Date;
  validationCode: string;
}) {
  return {
    title: notice.title,
    category: notice.category,
    publishedAt: notice.publishedAt,
    validationUrl: `/validar-aviso/${notice.validationCode}`,
  };
}
