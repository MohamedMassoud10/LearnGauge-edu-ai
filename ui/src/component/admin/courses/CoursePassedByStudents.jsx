import { useAllStudentsRegisteredACourse } from "../../../hooks/useCourseRegistration";
import { useStudentCourseGrade } from "../../../hooks/useGrades";

// Component to display individual student grade
function StudentGradeRow({ student, courseId }) {
  const { data: gradeData, isLoading: loadingGrade } = useStudentCourseGrade(
    student.student._id,
    courseId
  );

  const grade = gradeData?.data?.data;

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-3">{student?.student?.name}</td>
      <td className="px-4 py-3">{student?.student?.studentId}</td>
      <td className="px-4 py-3">{student?.student?.email}</td>
      <td className="px-4 py-3">{student?.student?.major}</td>

      <td className="px-4 py-3">
        {loadingGrade ? (
          <span className="text-gray-500">Loading...</span>
        ) : grade ? (
          <div className="space-y-1">
            <div className="font-semibold">
              {grade?.letterGrade} ({grade?.totalGrade}/100)
            </div>
            <div className="text-sm text-gray-600">
              Midterm: {grade?.midterm} | Final: {grade?.final} | Quizzes:{" "}
              {grade?.quizzes} | Assignments: {grade?.assignments}
            </div>
          </div>
        ) : (
          <span className="text-gray-500">No grade available</span>
        )}
      </td>
    </tr>
  );
}

export default function CoursePassedByStudents({ courseId }) {
  const {
    data: studentsData,
    isLoading,
    isError,
  } = useAllStudentsRegisteredACourse(courseId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading students...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error loading students data
      </div>
    );
  }

  const students = studentsData?.data?.data || [];

  if (students.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No students registered for this course
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          Registered Students & Grades ({students.length} students)
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Major
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <StudentGradeRow
                key={student?._id}
                student={student}
                courseId={courseId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
