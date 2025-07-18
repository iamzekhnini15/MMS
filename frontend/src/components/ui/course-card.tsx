import { Clock, MapPin, User, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Course } from '@/types';

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (courseId: number) => void;
}

const CourseCard = ({ course, onEdit, onDelete }: CourseCardProps) => {
  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className="absolute inset-1 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-r-lg p-2 text-xs hover:from-blue-100 hover:to-blue-200 transition-all group cursor-pointer shadow-sm"
      onClick={() => onEdit(course)}
    >
      <div className="space-y-1">
        <div className="font-medium text-blue-900 truncate text-sm">
          {course.name}
        </div>

        <div className="flex items-center text-blue-700">
          <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
          <span className="truncate">
            {formatTime(course.startDateTime)} -{' '}
            {formatTime(course.endDateTime)}
          </span>
        </div>

        <div className="flex items-center text-blue-700">
          <User className="w-3 h-3 mr-1 flex-shrink-0" />
          <span className="truncate">
            {course.teacher.user.firstname} {course.teacher.user.lastname}
          </span>
        </div>

        <div className="flex items-center text-blue-700">
          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
          <span className="truncate">{course.classroom.name}</span>
        </div>
      </div>

      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-200"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(course);
            }}
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-200"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(course.idCourse);
            }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
