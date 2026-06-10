export interface LessonModelData {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  content?: string | null;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}
