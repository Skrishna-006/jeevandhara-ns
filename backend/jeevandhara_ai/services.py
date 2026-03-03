import logging
from django.utils import timezone
from django.db import transaction

from medical_cases.models import MedicalCase, MedicalDocument
from .text_extraction import extract_text
from .llm_medical_analyzer import analyze_medical_reports

logger = logging.getLogger(__name__)


def run_ai_analysis_for_case(case_id: int) -> dict:
    """Perform end-to-end AI analysis for a given medical case.

    This function is synchronous and will update the MedicalCase record with
    results or failure status. It returns the analysis result dict (may be
    default/fallback if error occurs).
    """
    result = {}
    try:
        case = MedicalCase.objects.get(id=case_id)
    except MedicalCase.DoesNotExist:
        logger.error("AI analysis requested for non-existent case %s", case_id)
        return {}

    # mark processing
    case.ai_processing_status = "PROCESSING"
    case.save(update_fields=["ai_processing_status"])

    docs = case.documents.all()
    texts = []
    for doc in docs:
        try:
            # use path from file field
            fp = doc.file.path
            text = extract_text(fp)
            doc.extracted_text = text
            doc.save(update_fields=["extracted_text"])
            texts.append(text)
        except Exception as e:
            logger.exception("failed to extract text for document %s: %s", doc.id, e)
            # continue with whatever we have

    patient_info = {
        "patient_full_name": case.patient_full_name,
        "age": case.age,
        "gender": case.gender,
        "disease": case.disease,
    }
    campaign_details = {
        "hospital_name": case.hospital.name if case.hospital else None,
        "treating_doctor": case.treating_doctor,
        "required_funding": float(case.required_funding),
    }

    try:
        analysis = analyze_medical_reports(patient_info, campaign_details, texts)
        # write back results
        case.ai_credibility_score = analysis.get("credibility_score")
        case.ai_recommendation = analysis.get("recommendation")
        case.ai_confidence_level = analysis.get("confidence_level")
        case.ai_summary = analysis.get("summary")
        case.ai_detailed_analysis = analysis.get("detailed_analysis")
        case.ai_verified_at = timezone.now()
        case.ai_processing_status = "COMPLETED"
        case.save(
            update_fields=[
                "ai_credibility_score",
                "ai_recommendation",
                "ai_confidence_level",
                "ai_summary",
                "ai_detailed_analysis",
                "ai_verified_at",
                "ai_processing_status",
            ]
        )
        result = analysis
    except Exception as e:
        logger.exception("AI analysis failed for case %s: %s", case_id, e)
        case.ai_processing_status = "FAILED"
        case.ai_recommendation = "REVIEW"
        case.save(update_fields=["ai_processing_status", "ai_recommendation"])
        result = {
            "credibility_score": None,
            "recommendation": "REVIEW",
            "error": str(e),
        }
    return result


# commented future async wrapper
#
# from celery import shared_task
#
# @shared_task(bind=True)
# def analyze_case_async(self, case_id: int):
#     """Celery task wrapper around run_ai_analysis_for_case.
#     Calling code can replace synchronous invocation with this task later.
#     """
#     return run_ai_analysis_for_case(case_id)
