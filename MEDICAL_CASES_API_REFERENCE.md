# Medical Cases API - Request/Response Examples

## Authentication Setup

All endpoints require Bearer JWT token in Authorization header.

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 1️⃣ POST /api/medical-cases/ - Create Medical Case

### Request

```http
POST /api/medical-cases/ HTTP/1.1
Host: localhost:8000
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: multipart/form-data; boundary=----Boundary

------Boundary
Content-Disposition: form-data; name="patient_full_name"

John Doe
------Boundary
Content-Disposition: form-data; name="age"

45
------Boundary
Content-Disposition: form-data; name="gender"

Male
------Boundary
Content-Disposition: form-data; name="contact_number"

+919876543210
------Boundary
Content-Disposition: form-data; name="address"

123 Main Street, Delhi, India
------Boundary
Content-Disposition: form-data; name="disease"

Heart Disease
------Boundary
Content-Disposition: form-data; name="hospital"

1
------Boundary
Content-Disposition: form-data; name="treating_doctor"

Dr. Rajesh Kumar
------Boundary
Content-Disposition: form-data; name="treatment_description"

Coronary Artery Bypass Graft (CABG) surgery
------Boundary
Content-Disposition: form-data; name="estimated_cost"

500000.00
------Boundary
Content-Disposition: form-data; name="required_funding"

450000.00
------Boundary
Content-Disposition: form-data; name="campaign_description"

I need financial assistance for my bypass surgery. My family is struggling to arrange funds.
------Boundary
Content-Disposition: form-data; name="urgency_level"

High
------Boundary
Content-Disposition: form-data; name="uploaded_files"; filename="prescription.pdf"
Content-Type: application/pdf

[Binary PDF data here]
------Boundary
Content-Disposition: form-data; name="uploaded_files"; filename="medical_report.jpg"
Content-Type: image/jpeg

[Binary JPG data here]
------Boundary--
```

### cURL Example

```bash
curl -X POST http://localhost:8000/api/medical-cases/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "patient_full_name=John Doe" \
  -F "age=45" \
  -F "gender=Male" \
  -F "contact_number=+919876543210" \
  -F "address=123 Main Street, Delhi, India" \
  -F "disease=Heart Disease" \
  -F "hospital=1" \
  -F "treating_doctor=Dr. Rajesh Kumar" \
  -F "treatment_description=Coronary Artery Bypass Graft (CABG) surgery" \
  -F "estimated_cost=500000.00" \
  -F "required_funding=450000.00" \
  -F "campaign_description=I need financial assistance for my bypass surgery" \
  -F "urgency_level=High" \
  -F "uploaded_files=@prescription.pdf" \
  -F "uploaded_files=@medical_report.jpg"
```

### JavaScript Fetch Example

```javascript
const formData = new FormData();
formData.append("patient_full_name", "John Doe");
formData.append("age", "45");
formData.append("gender", "Male");
formData.append("contact_number", "+919876543210");
formData.append("address", "123 Main Street, Delhi, India");
formData.append("disease", "Heart Disease");
formData.append("hospital", "1");
formData.append("treating_doctor", "Dr. Rajesh Kumar");
formData.append(
  "treatment_description",
  "Coronary Artery Bypass Graft (CABG) surgery",
);
formData.append("estimated_cost", "500000.00");
formData.append("required_funding", "450000.00");
formData.append(
  "campaign_description",
  "I need financial assistance for my bypass surgery",
);
formData.append("urgency_level", "High");

// Add files
const prescriptionFile = document.getElementById("prescription").files[0];
const reportFile = document.getElementById("report").files[0];
formData.append("uploaded_files", prescriptionFile);
formData.append("uploaded_files", reportFile);

const response = await fetch("http://localhost:8000/api/medical-cases/", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
  body: formData,
});

const data = await response.json();
console.log(data);
```

### Success Response (201 Created)

```json
{
  "case_id": 1,
  "message": "Case submitted successfully"
}
```

### Error Response (400 Bad Request)

```json
{
  "patient_full_name": ["This field may not be blank."],
  "age": ["A valid integer is required."],
  "hospital": ["Invalid pk \"99\" - object does not exist."]
}
```

### Error Response (403 Forbidden - Not NORMAL_USER)

```json
{
  "detail": "You do not have permission to perform this action."
}
```

---

## 2️⃣ GET /api/medical-cases/my-cases/ - Get User's Cases

### Request

```http
GET /api/medical-cases/my-cases/ HTTP/1.1
Host: localhost:8000
Authorization: Bearer {ACCESS_TOKEN}
```

### cURL Example

```bash
curl -X GET http://localhost:8000/api/medical-cases/my-cases/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### JavaScript Fetch Example

```javascript
const response = await fetch(
  "http://localhost:8000/api/medical-cases/my-cases/",
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  },
);

const cases = await response.json();
console.log(cases);
```

### Success Response (200 OK)

```json
[
  {
    "id": 1,
    "patient_full_name": "John Doe",
    "age": 45,
    "gender": "Male",
    "contact_number": "+919876543210",
    "address": "123 Main Street, Delhi, India",
    "disease": "Heart Disease",
    "hospital": 1,
    "hospital_name": "Apollo Hospitals",
    "treating_doctor": "Dr. Rajesh Kumar",
    "treatment_description": "Coronary Artery Bypass Graft (CABG) surgery",
    "estimated_cost": "500000.00",
    "required_funding": "450000.00",
    "campaign_description": "I need financial assistance for my bypass surgery",
    "urgency_level": "High",
    "status": "PENDING",
    "documents": [
      {
        "id": 1,
        "file": "/media/medical_documents/prescription_abc123.pdf",
        "uploaded_at": "2024-03-03T10:30:00Z"
      },
      {
        "id": 2,
        "file": "/media/medical_documents/medical_report_def456.jpg",
        "uploaded_at": "2024-03-03T10:30:15Z"
      }
    ],
    "created_at": "2024-03-03T10:30:00Z",
    "updated_at": "2024-03-03T10:30:00Z"
  },
  {
    "id": 2,
    "patient_full_name": "Jane Smith",
    "age": 35,
    "gender": "Female",
    "contact_number": "+919123456789",
    "address": "456 Oak Avenue, Mumbai, India",
    "disease": "Cancer",
    "hospital": 2,
    "hospital_name": "Max Healthcare",
    "treating_doctor": "Dr. Priya Sharma",
    "treatment_description": "Chemotherapy and radiation therapy",
    "estimated_cost": "800000.00",
    "required_funding": "700000.00",
    "campaign_description": "Seeking support for cancer treatment",
    "urgency_level": "High",
    "status": "HOSPITAL_VERIFIED",
    "documents": [
      {
        "id": 3,
        "file": "/media/medical_documents/biopsy_report.pdf",
        "uploaded_at": "2024-03-02T14:20:00Z"
      }
    ],
    "created_at": "2024-03-02T14:20:00Z",
    "updated_at": "2024-03-02T14:20:00Z"
  }
]
```

### Empty Response (200 OK - No cases)

```json
[]
```

### Error Response (401 Unauthorized)

```json
{
  "detail": "Authentication credentials were not provided."
}
```

### Error Response (403 Forbidden)

```json
{
  "detail": "You do not have permission to perform this action."
}
```

---

## Status Values Reference

| Status              | Meaning                               | Notes                   |
| ------------------- | ------------------------------------- | ----------------------- |
| `PENDING`           | Case submitted, awaiting verification | Default status          |
| `HOSPITAL_VERIFIED` | Hospital verified the case            | Can now receive funding |
| `FUNDED`            | Case fully funded                     | Funding goal reached    |

---

## Gender Options

- `Male`
- `Female`
- `Other`

---

## Urgency Level Options

- `Low` - Non-emergency case
- `Medium` - Regular priority
- `High` - Urgent/critical need

---

## File Upload Details

### Supported Formats

- `application/pdf` (.pdf)
- `image/jpeg` (.jpg, .jpeg)
- `image/png` (.png)

### Constraints

- Multiple files allowed
- Max size: No hard limit (configurable)
- Stored in: `media/medical_documents/`
- Accessed via: `http://localhost:8000/media/medical_documents/{filename}`

### Example File Upload in React

```javascript
const handleFileChange = (e) => {
  const files = e.target.files;
  for (let file of files) {
    // Validate
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      alert("Only PDF, JPG, PNG allowed");
      return;
    }
    // Add to FormData
    formData.append("uploaded_files", file);
  }
};
```

---

## Error Code Reference

| Code  | Meaning                                  |
| ----- | ---------------------------------------- |
| `400` | Bad Request - Missing/invalid fields     |
| `401` | Unauthorized - No token or invalid token |
| `403` | Forbidden - Not NORMAL_USER role         |
| `404` | Not Found - Hospital doesn't exist       |
| `500` | Server Error - Contact admin             |

---

## Validation Rules

### Patient Details

- `patient_full_name`: Required, string
- `age`: Required, integer (1-150)
- `gender`: Required, choice (Male/Female/Other)
- `contact_number`: Required, string (validate format in frontend)
- `address`: Required, text

### Medical Details

- `disease`: Required, string
- `hospital`: Required, integer (valid hospital ID)
- `treating_doctor`: Required, string
- `treatment_description`: Required, text
- `estimated_cost`: Required, decimal (≥ 0)

### Campaign Details

- `required_funding`: Required, decimal (≥ 0)
- `campaign_description`: Required, text
- `urgency_level`: Required, choice (Low/Medium/High)

### Documents

- `uploaded_files`: Optional, array of files
- Format: PDF, JPG, PNG
- Multiple files allowed

---

## Testing Checklist

- [ ] Create case with all required fields
- [ ] Create case with file uploads
- [ ] Create case without optional files
- [ ] Verify user_id auto-assigned
- [ ] Fetch all cases for logged-in user
- [ ] Test without authorization header (401)
- [ ] Test with non-NORMAL_USER role (403)
- [ ] Test invalid hospital ID (400)
- [ ] Test missing required fields (400)
- [ ] Verify files saved to media folder
- [ ] Verify documents linked to case

---

## Integration Testing

```javascript
// 1. Login and get token
const loginRes = await fetch("http://localhost:8000/api/token", {
  method: "POST",
  body: JSON.stringify({ email: "user@example.com", password: "password" }),
});
const { access } = await loginRes.json();

// 2. Create case
const formData = new FormData();
// ... populate formData ...
const caseRes = await fetch("http://localhost:8000/api/medical-cases/", {
  method: "POST",
  headers: { Authorization: `Bearer ${access}` },
  body: formData,
});
const { case_id } = await caseRes.json();

// 3. Get cases
const casesRes = await fetch(
  "http://localhost:8000/api/medical-cases/my-cases/",
  {
    headers: { Authorization: `Bearer ${access}` },
  },
);
const cases = await casesRes.json();

// 4. Verify case in list
const createdCase = cases.find((c) => c.id === case_id);
console.log("Created case:", createdCase);
```

---

## Production Deployment Notes

1. **Disable DEBUG mode**
2. **Use proper MEDIA storage** (S3, Azure Blob, etc.)
3. **Set ALLOWED_HOSTS** correctly
4. **Enable HTTPS** for security
5. **Update CORS_ALLOWED_ORIGINS** with production domain
6. **Set proper JWT expiry times**
7. **Use environment variables** for secrets
8. **Enable CSRF protection** for production

---

**Last Updated:** March 3, 2024
**API Version:** 1.0
**Status:** Ready for Testing ✅
