"use client";

import JobForm from "@/components/admin/JobForm";

export default function NewJobPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">افزودن شغل جدید</h2>
        <p className="text-sm text-gray-600 mt-1">
          اطلاعات شغل را وارد کنید
        </p>
      </div>

      <JobForm />
    </div>
  );
}
