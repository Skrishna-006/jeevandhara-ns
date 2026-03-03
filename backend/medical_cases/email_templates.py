"""
Professional HTML email templates for JeevanDhara email workflow.
"""

def get_hospital_verification_email_html(medical_case):
    """
    Generate professional HTML email for hospital verification request.
    """
    hospital_name = medical_case.hospital.name if medical_case.hospital else "N/A"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 700px;
                margin: 0 auto;
                background-color: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 8px;
                overflow: hidden;
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }}
            .header h1 {{
                margin: 0;
                font-size: 28px;
            }}
            .header p {{
                margin: 5px 0 0 0;
                font-size: 14px;
                opacity: 0.9;
            }}
            .content {{
                padding: 30px;
            }}
            .section {{
                margin-bottom: 25px;
            }}
            .section h2 {{
                color: #667eea;
                font-size: 18px;
                border-bottom: 2px solid #667eea;
                padding-bottom: 10px;
                margin-bottom: 15px;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
                background: white;
            }}
            table th {{
                background-color: #f0f0f0;
                padding: 12px;
                text-align: left;
                font-weight: 600;
                border: 1px solid #ddd;
            }}
            table td {{
                padding: 12px;
                border: 1px solid #ddd;
            }}
            .label {{
                font-weight: 600;
                color: #667eea;
            }}
            .value {{
                color: #333;
            }}
            .summary-box {{
                background: #e8f4f8;
                border-left: 4px solid #667eea;
                padding: 15px;
                margin: 15px 0;
                border-radius: 4px;
            }}
            .footer {{
                background-color: #f0f0f0;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #ddd;
            }}
            .signature {{
                margin-top: 30px;
                font-style: italic;
                color: #767676;
            }}
            .action-note {{
                background: #fffbea;
                border: 1px solid #ffd966;
                padding: 15px;
                border-radius: 4px;
                margin: 20px 0;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>JeevanDhara</h1>
                <p>Medical Verification System</p>
            </div>
            
            <div class="content">
                <div class="action-note">
                    <strong>⚠️ Action Required:</strong> Please verify and confirm this medical case. Upon confirmation, 
                    the admin will update the case status and proceed with funding requests to universities.
                </div>
                
                <div class="section">
                    <h2>Patient Information</h2>
                    <table>
                        <tr>
                            <td class="label">Patient Name:</td>
                            <td class="value">{medical_case.patient_full_name}</td>
                        </tr>
                        <tr>
                            <td class="label">Age / Gender:</td>
                            <td class="value">{medical_case.age} years / {medical_case.gender}</td>
                        </tr>
                        <tr>
                            <td class="label">Contact Number:</td>
                            <td class="value">{medical_case.contact_number}</td>
                        </tr>
                        <tr>
                            <td class="label">Address:</td>
                            <td class="value">{medical_case.address}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="section">
                    <h2>Medical Details</h2>
                    <table>
                        <tr>
                            <td class="label">Disease / Condition:</td>
                            <td class="value">{medical_case.disease}</td>
                        </tr>
                        <tr>
                            <td class="label">Hospital Name:</td>
                            <td class="value">{hospital_name}</td>
                        </tr>
                        <tr>
                            <td class="label">Treating Doctor:</td>
                            <td class="value">{medical_case.treating_doctor}</td>
                        </tr>
                        <tr>
                            <td class="label">Treatment Description:</td>
                            <td class="value">{medical_case.treatment_description}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="section">
                    <h2>Financial Summary</h2>
                    <div class="summary-box">
                        <table style="margin: 0;">
                            <tr>
                                <td class="label">Estimated Treatment Cost:</td>
                                <td class="value">₹{medical_case.estimated_cost:,.2f}</td>
                            </tr>
                            <tr>
                                <td class="label">Required Funding:</td>
                                <td class="value" style="color: #d9534f; font-weight: bold;">₹{medical_case.required_funding:,.2f}</td>
                            </tr>
                            <tr>
                                <td class="label">Annual Family Income:</td>
                                <td class="value">₹{medical_case.annual_family_income:,.2f}</td>
                            </tr>
                            <tr>
                                <td class="label">Family Members:</td>
                                <td class="value">{medical_case.family_members_count}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                
                <div class="section">
                    <h2>AI Credibility Assessment</h2>
                    <table>
                        <tr>
                            <td class="label">AI Score:</td>
                            <td class="value">{medical_case.ai_credibility_score or 'N/A'}</td>
                        </tr>
                        <tr>
                            <td class="label">Recommendation:</td>
                            <td class="value">{medical_case.ai_recommendation or 'N/A'}</td>
                        </tr>
                        <tr>
                            <td class="label">Confidence Level:</td>
                            <td class="value">{medical_case.ai_confidence_level or 'N/A'}</td>
                        </tr>
                        <tr>
                            <td class="label">Summary:</td>
                            <td class="value">{medical_case.ai_summary or 'N/A'}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="section">
                    <p>Please review the case details and confirm the authenticity of this medical requirement. 
                    Your verification is crucial in helping deserving patients receive necessary medical assistance.</p>
                    <p>If you have any questions or require additional documentation, please contact our admin team.</p>
                </div>
                
                <div class="signature">
                    <p>Best regards,<br>
                    JeevanDhara Admin Team<br>
                    Medical Verification System</p>
                </div>
            </div>
            
            <div class="footer">
                <p>This is an automated email from JeevanDhara Medical Verification System. 
                Please do not reply to this email.</p>
                <p>&copy; 2026 JeevanDhara. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    return html


def get_university_funding_email_html(medical_case):
    """
    Generate professional HTML email for university funding request.
    """
    hospital_name = medical_case.hospital.name if medical_case.hospital else "N/A"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 700px;
                margin: 0 auto;
                background-color: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 8px;
                overflow: hidden;
            }}
            .header {{
                background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }}
            .header h1 {{
                margin: 0;
                font-size: 28px;
            }}
            .header p {{
                margin: 5px 0 0 0;
                font-size: 14px;
                opacity: 0.9;
            }}
            .content {{
                padding: 30px;
            }}
            .section {{
                margin-bottom: 25px;
            }}
            .section h2 {{
                color: #11998e;
                font-size: 18px;
                border-bottom: 2px solid #11998e;
                padding-bottom: 10px;
                margin-bottom: 15px;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
                background: white;
            }}
            table th {{
                background-color: #f0f0f0;
                padding: 12px;
                text-align: left;
                font-weight: 600;
                border: 1px solid #ddd;
            }}
            table td {{
                padding: 12px;
                border: 1px solid #ddd;
            }}
            .label {{
                font-weight: 600;
                color: #11998e;
            }}
            .value {{
                color: #333;
            }}
            .summary-box {{
                background: #e8f8f5;
                border-left: 4px solid #11998e;
                padding: 15px;
                margin: 15px 0;
                border-radius: 4px;
            }}
            .footer {{
                background-color: #f0f0f0;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #ddd;
            }}
            .signature {{
                margin-top: 30px;
                font-style: italic;
                color: #767676;
            }}
            .action-note {{
                background: #e8f8f5;
                border: 1px solid #11998e;
                padding: 15px;
                border-radius: 4px;
                margin: 20px 0;
                font-size: 14px;
                font-weight: 500;
            }}
            .ai-badge {{
                display: inline-block;
                background: #38ef7d;
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>JeevanDhara</h1>
                <p>Funding Request Notification</p>
            </div>
            
            <div class="content">
                <div class="action-note">
                    💰 A verified medical case requiring financial assistance has been identified. 
                    We invite you to participate in providing aid to this deserving patient.
                </div>
                
                <div class="section">
                    <h2>Case Overview</h2>
                    <div class="summary-box">
                        <table style="margin: 0;">
                            <tr>
                                <td class="label">Case ID:</td>
                                <td class="value">MC-{medical_case.id}</td>
                            </tr>
                            <tr>
                                <td class="label">Patient:</td>
                                <td class="value">{medical_case.patient_full_name}</td>
                            </tr>
                            <tr>
                                <td class="label">Disease:</td>
                                <td class="value">{medical_case.disease}</td>
                            </tr>
                            <tr>
                                <td class="label">Hospital:</td>
                                <td class="value">{hospital_name}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                
                <div class="section">
                    <h2>Patient Information</h2>
                    <table>
                        <tr>
                            <td class="label">Age / Gender:</td>
                            <td class="value">{medical_case.age} years / {medical_case.gender}</td>
                        </tr>
                        <tr>
                            <td class="label">Employment Status:</td>
                            <td class="value">{medical_case.employment_status}</td>
                        </tr>
                        <tr>
                            <td class="label">Annual Family Income:</td>
                            <td class="value">₹{medical_case.annual_family_income:,.2f}</td>
                        </tr>
                        <tr>
                            <td class="label">Family Members:</td>
                            <td class="value">{medical_case.family_members_count}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="section">
                    <h2>Medical & Financial Details</h2>
                    <table>
                        <tr>
                            <td class="label">Treatment Description:</td>
                            <td class="value">{medical_case.treatment_description}</td>
                        </tr>
                        <tr>
                            <td class="label">Estimated Treatment Cost:</td>
                            <td class="value">₹{medical_case.estimated_cost:,.2f}</td>
                        </tr>
                        <tr>
                            <td class="label">Required Funding:</td>
                            <td class="value" style="color: #d9534f; font-weight: bold;">₹{medical_case.required_funding:,.2f}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="section">
                    <h2>AI Verification Status</h2>
                    <div class="summary-box">
                        <table style="margin: 0;">
                            <tr>
                                <td class="label">Hospital Verified:</td>
                                <td class="value">✓ Yes</td>
                            </tr>
                            <tr>
                                <td class="label">AI Credibility Score:</td>
                                <td class="value"><span class="ai-badge">{medical_case.ai_credibility_score or 'N/A'}</span></td>
                            </tr>
                            <tr>
                                <td class="label">AI Recommendation:</td>
                                <td class="value">{medical_case.ai_recommendation or 'N/A'}</td>
                            </tr>
                            <tr>
                                <td class="label">Confidence Level:</td>
                                <td class="value">{medical_case.ai_confidence_level or 'N/A'}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                
                <div class="section">
                    <p>This case has been verified by our hospital partners and has passed AI credibility assessment. 
                    We believe this is a deserving case and would greatly appreciate your institution's participation 
                    in providing financial assistance.</p>
                    <p>Your contribution can make a significant difference in this patient's life and medical recovery.</p>
                </div>
                
                <div class="signature">
                    <p>Thank you for your compassion and support,<br>
                    JeevanDhara Team<br>
                    Connecting Care & Funding</p>
                </div>
            </div>
            
            <div class="footer">
                <p>This is an automated email from JeevanDhara Medical Verification System. 
                Please do not reply to this email. For inquiries, contact our admin team.</p>
                <p>&copy; 2026 JeevanDhara. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    return html
