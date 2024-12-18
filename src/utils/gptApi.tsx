import axios from 'axios';

const generateSupplementDescription = async (supplementInfo: {
  coreIngredients: string;
  efficacy: string;
  precautions: string;
}): Promise<string> => {
  const { coreIngredients, efficacy} = supplementInfo;
  console.log("주요 성분:", coreIngredients);
  console.log("효능:", efficacy);
  const prompt = `
  당신은 약사입니다. 사용자가 찾은 영양제에 대한 정보를 바탕으로 설명해주세요.
  - 성분: ${coreIngredients}
  - 효능: ${efficacy}

  1. 이 영양제의 성분 중 함량이 가장 높은 상위 2가지 주요 성분을 알려주세요.
  2. 해당 핵심 성분의 효능과 역할을 "일반인이 이해하기 쉽게" 설명해주세요.
  3. 이 영양제는 어떤 건강 문제에 도움을 주는지 알려주세요.
  4. 어떤 사람에게 이 영양제가 적합한지 설명해주세요.

  간결하고 명확하게 답변 부탁드립니다.
  `;

  try {
    const response = await axios.post('https://172.20.10.2:5000/api/generate', {
      prompt,
    });
    return response.data.content || '응답이 비어 있습니다.';
  } catch (error) {
    console.error('Error fetching supplement description:', error);
    return '응답 생성에 실패했습니다.';
  }
  
};


export default generateSupplementDescription;
