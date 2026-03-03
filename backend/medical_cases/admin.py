from django.contrib import admin
from .models import MedicalCase, MedicalDocument


@admin.register(MedicalCase)
class MedicalCaseAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'patient_full_name',
        'disease',
        'hospital',
        'status',
        'created_at',
    ]
    list_filter = ['status', 'employment_status', 'government_scheme_enrolled', 'created_at']
    search_fields = ['patient_full_name', 'disease', 'user__email']
    readonly_fields = ['created_at', 'updated_at', 'user']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Patient Details', {
            'fields': ('patient_full_name', 'age', 'gender', 'contact_number', 'address')
        }),
        ('Medical Details', {
            'fields': ('disease', 'hospital', 'treating_doctor', 'treatment_description', 'estimated_cost', 'required_funding')
        }),
        ('Financial Details', {
            'fields': ('annual_family_income', 'family_members_count', 'employment_status', 'government_scheme_enrolled')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(MedicalDocument)
class MedicalDocumentAdmin(admin.ModelAdmin):
    list_display = ['id', 'medical_case', 'document_type', 'file', 'uploaded_at']
    list_filter = ['document_type', 'uploaded_at']
    search_fields = ['medical_case__patient_full_name']
    readonly_fields = ['uploaded_at']
