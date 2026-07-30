import { Request, Response } from "express";
import { PDFParse } from "pdf-parse";
import { generateResponse } from "../services/aiService.js";
import { interviewReportModel } from "../models/reportModel.js";

export const generateInterviewReport = async (req: Request, res: Response) => {
  const resume = req.file;
  if (!resume?.buffer) {
    return res.status(400).json({
      message: "Resume file is required",
    });
  }

  const parser = new PDFParse({
    data: resume.buffer,
  });

  const parsedPdf = await parser.getText();

  const resumeText = parsedPdf.text;

  const { jobDescription, selfDescription } = req.body;

  const reportByAi = await generateResponse({
    resume: resumeText,
    jobDescription: jobDescription,
    selfDescription: selfDescription,
  });

  const interviewReport = await interviewReportModel.create({
    userId: req.user?.id,

    resume: resumeText,

    selfDescription,

    jobDescription,

    ...reportByAi,
  });

  res.status(201).json({
    message: "Interview Report generated successfully",
    interviewReport,
    success: true,
  });
};

export const getInterviewReportById = async (req: Request, res: Response) => {
  {
    const reportId = req.params.id;

    const report = await interviewReportModel.findById(reportId);

    if (!report) {
      return res.status(404).json({
        message: "Interview report not found",
        success: false,
      });
    }

    res.status(200).json({
      success: true,
      interviewReport: report,
    });
  }
};

export const getAllInterviewReports = async (req: Request, res: Response) => {
  try {
    const reports = await interviewReportModel.find({ userId: req.user?.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reports",
      success: false,
    });
  }
};

export const deleteInterviewReport = async (req: Request, res: Response) => {
  try {
    const reportId = req.params.id;
    const report = await interviewReportModel.findOneAndDelete({
      _id: reportId,
      userId: req.user?.id,
    });

    if (!report) {
      return res.status(404).json({
        message: "Interview report not found or unauthorized",
        success: false,
      });
    }

    res.status(200).json({
      success: true,
      message: "Interview report deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Failed to delete report",
      success: false,
    });
  }
};

export const getPreparationRoadmaps = async (req: Request, res: Response) => {
  try {
    const reports = await interviewReportModel
      .find({ userId: req.user?.id })
      .select("_id jobDescription preparationPlan createdAt")
      .sort({ createdAt: -1 });

    const roadmaps = reports.map((report) => {
      const jobSnippet = report.jobDescription?.trim().split('\n')[0] || 'Target Role';
      const jobTitle = jobSnippet.length > 55 ? jobSnippet.substring(0, 55) + '...' : jobSnippet;
      return {
        reportId: report._id,
        jobTitle,
        preparationPlan: report.preparationPlan || [],
        createdAt: report.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      roadmaps,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Failed to fetch roadmaps",
      success: false,
    });
  }
};
