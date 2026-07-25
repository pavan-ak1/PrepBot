import axios from "axios";

export const fetchInterviewReport = async (
  reportId: string,
  token: string
) => {
  let baseUrl = process.env.JOBPREP_SERVICE_URL || "";
  
  // Trim trailing slash
  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }

  // Default path for direct service-to-service communication
  let path = "/api/v1/interview/reports";
  
  // If the service URL is set to the API Gateway, we must route via /api/v1/jobprep
  // instead of the direct internal /api/v1/interview endpoint.
  if (baseUrl.includes("gateway") || baseUrl.includes("3000")) {
    path = "/api/v1/jobprep/reports";
  }

  const targetUrl = `${baseUrl}${path}/${reportId}`;
  console.log(`[Session Service] Fetching interview report from: ${targetUrl}`);

  try {
    const response = await axios.get(targetUrl, {
      headers: {
        Authorization: token,
      },
    });

    return response.data.interviewReport;
  } catch (error: any) {
    console.error(`[Session Service] Failed to fetch report from ${targetUrl}:`, error.message);
    if (error.response) {
      console.error(`[Session Service] Error response status: ${error.response.status}`);
      console.error(`[Session Service] Error response data:`, JSON.stringify(error.response.data));
    }
    throw error;
  }
};