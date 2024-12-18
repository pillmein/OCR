// 주요 성분 및 함량 추출
const extractCoreIngredientInfo = (standardInfo: string): string => {
    const matches = standardInfo.match(/실리마린|비타민 [B\d]+|비타민 C|아연/gi);
    const extractedInfo = matches
        ? matches
            .map((ingredient) => {
                const match = standardInfo.match(
                    new RegExp(`${ingredient}\\s*:\\s*표시량\\(([^)]+)\\)\\s*의\\s*([^\\n]+)`)
                );
                if (match) {
                    return `${ingredient}: ${match[1]} (${match[2]})`;
                }
                return `${ingredient}: 정보 없음`;
            })
        : [];
    return extractedInfo.join(', ');
};

// 데이터를 처리하여 최종 정보를 반환하는 함수
export const formatSupplementInfo = (product: any): {
    coreIngredients: string;
    efficacy: string;
    precautions: string;
} => {
    // 주요 성분 추출
    const coreIngredients = extractCoreIngredientInfo(product.STDR_STND || "");

    // 효능 추출
    const efficacy = product?.PRIMARY_FNCLTY
        ? product.PRIMARY_FNCLTY.replace(/\[|\]/g, "") // [밀크씨슬추출물] 같은 태그 제거
        : "정보 없음";

    // 주의사항 추출
    const precautions = product?.IFTKN_ATNT_MATR_CN || "없음";

    // 반환할 데이터 구성
    return {
        coreIngredients,
        efficacy,
        precautions,
    };
};
