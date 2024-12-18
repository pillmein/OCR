import axios from 'axios';
import { calculateJaccardSimilarity } from './extractText';

const extractProductKeywords = (ocrText: string): string[] => {
    const koreanText = ocrText.match(/[가-힣]+/g) || [];
    return koreanText.filter((word) => word.length > 1); // 2글자 이상만 포함
};

export const fetchMatchedSupplementData = async (ocrText: string) => {
    const OpenAPI_KEY = import.meta.env.VITE_OpenAPI_KEY;
    const OpenAPI_URL = `https://openapi.foodsafetykorea.go.kr/api/${OpenAPI_KEY}/C003/json/2500/3000`;

    try {
        // 1. OCR 텍스트에서 공백 제거
        const normalizedOCRText = ocrText.replace(/\s+/g, ''); // 공백 제거
        // 2. 키워드 추출
        const keywords = extractProductKeywords(normalizedOCRText);
        if (!keywords.length) throw new Error('OCR에서 키워드를 찾을 수 없습니다.');
        // 3. API 데이터 호출
        const response = await axios.get(OpenAPI_URL);
        const data = response.data;
        const products = data?.C003?.row;
        if (!products || !Array.isArray(products)) {
            throw new Error('API에서 제품 데이터를 찾을 수 없습니다.');
        }
        // 4. Exact Match 방식 (정확히 일치하는 제품 찾기)
        const exactMatch = products.find((product: any) => {
            const normalizedProductName = product.PRDLST_NM.replace(/\s+/g, '').match(/[가-힣]+/g)?.join('') || '';
            return normalizedProductName === normalizedOCRText;
        });
        if (exactMatch) {
            return exactMatch; // 정확히 일치하는 제품 반환
        }
        
        // 5. 유사도 계산 (Exact Match 실패 시)
        let bestMatch: any = null;
        let highestSimilarity = 0;

        products.forEach((product: any) => {
            const normalizedProductName = product.PRDLST_NM.match(/[가-힣]+/g)?.join('') || '';
            const similarity = calculateJaccardSimilarity(keywords, normalizedProductName);
            if (similarity > highestSimilarity) {
                highestSimilarity = similarity;
                bestMatch = product;
            }
        });

        if (highestSimilarity < 0.2) {
            return { message: '유사한 제품명을 찾을 수 없습니다. 더 정확한 결과를 위해 텍스트를 다시 확인해주세요.' };
        }

        return bestMatch;
    } catch (error) {
        console.error('제품 매칭 실패:', error);
        throw error;
    }
};



