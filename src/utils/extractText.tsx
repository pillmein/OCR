export const calculateJaccardSimilarity = (keywords: string[], productName: string): number => {
    const productNGrams = new Set<string>();
    for (let i = 0; i < productName.length - 1; i++) {
        productNGrams.add(productName.slice(i, i + 2));
    }

    const keywordSet = new Set(keywords);
    const intersection = new Set([...keywordSet].filter((x) => productNGrams.has(x)));
    const union = new Set([...keywordSet, ...productNGrams]);

    return intersection.size / union.size;
};
