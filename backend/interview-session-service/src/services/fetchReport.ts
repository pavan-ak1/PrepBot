import axios from "axios";

export const fetchInterviewReport = async (
  reportId: string,
  token: string
) => {
  console.log(process.env.JOBPREP_SERVICE_URL);
  const response = await axios.get(
    `${process.env.JOBPREP_SERVICE_URL}/api/v1/interview/reports/${reportId}`,
    {
      headers: {
        Authorization: token,
      },
    }
  );

  return response.data.interviewReport;
};