import React from "react";
import { useUsers } from "../../hooks/useUsers";
import { useParams } from "react-router-dom";
import MaxWidthWrapper from "../../utils/MaxWidthWrapper";

export default function StudentDetailsPage() {
  const { id } = useParams();
  const { data: usersResponse, isLoading, isError } = useUsers();

  const usersArray = usersResponse?.data?.data || [];
  const student = usersArray.find((user) => user._id === id);

  if (isLoading) return <div>Loading student details...</div>;
  if (isError) return <div>Error loading student data.</div>;
  if (!student) return <div>No student found with ID: {id}</div>;

  return (
    <MaxWidthWrapper>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-2">Student Details</h1>
        <p>
          <strong>Name:</strong> {student.name}
        </p>
        <p>
          <strong>Email:</strong> {student.email}
        </p>
        <p>
          <strong>ID:</strong> {student._id}
        </p>
      </div>
    </MaxWidthWrapper>
  );
}
