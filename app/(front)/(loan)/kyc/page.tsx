"use client";
import KYCForm from "@/app/(front)/(loan)/kyc/(components)/KYCForm";
import KYCStatus from "@/app/(front)/(loan)/kyc/(components)/KYCStatus";
import { useState } from "react";


export default function KYCDashboard() {
  const [kycStatus, setKycStatus] = useState<{
    status: string;
    message: string;
  } | null>(null);

  return (
    <div className='max-w-lg mx-auto py-10'>
      {!kycStatus ? (
        <KYCForm onSuccess={setKycStatus} />
      ) : (
        <KYCStatus status={kycStatus.status} message={kycStatus.message} />
      )}
    </div>
  );
}
