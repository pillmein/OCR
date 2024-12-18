import axios from 'axios';

const API_KEY = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
const API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;

const analyzeImage = async (base64Image: string): Promise<string> => {
    const requestBody = {
        requests: [
            {
                image: {
                    content: base64Image
                },
                features: [{ type: "TEXT_DETECTION" }]
            }
        ]
    };

    try {
        const response = await axios.post(API_URL, requestBody);
        const annotations = response.data.responses[0]?.textAnnotations;
        const fullText = response.data.responses[0]?.fullTextAnnotation;

        if (!annotations || !fullText) {
            throw new Error('텍스트를 감지할 수 없습니다.');
        }

        // 블록별 텍스트 크기 비교
        const largestBlock = response.data.responses[0]?.fullTextAnnotation?.pages[0]?.blocks
            ?.map((block: any) => ({
                text: block.paragraphs.map((p: any) => p.words.map((w: any) => w.symbols.map((s: any) => s.text).join('')).join(' ')).join('\n'),
                area: calculateArea(block.boundingBox.vertices),
            }))
            .sort((a: any, b: any) => b.area - a.area)[0];

        return largestBlock?.text || fullText.text; // 가장 큰 텍스트 블록 반환
    } catch (error) {
        console.error('Error analyzing image:', error);
        throw new Error('이미지 분석 중 문제가 발생했습니다. 다시 시도해주세요.');
    }
};

// Helper 함수: Bounding Box 면적 계산
const calculateArea = (vertices: Array<{ x: number; y: number }>) => {
    if (vertices.length !== 4) return 0;
    const width = Math.abs(vertices[1].x - vertices[0].x);
    const height = Math.abs(vertices[2].y - vertices[0].y);
    return width * height;
};

export default analyzeImage;