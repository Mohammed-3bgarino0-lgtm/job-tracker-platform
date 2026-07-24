'use client';

import type {
  ParsedEducation,
  ParsedExperience,
  ParsedResumeData,
  ParsedSkill,
} from '@qaddem/shared';

interface ResumeCollectionsEditorProps {
  data: ParsedResumeData;
  onChange: (data: ParsedResumeData) => void;
}

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100';

export function ResumeCollectionsEditor({
  data,
  onChange,
}: ResumeCollectionsEditorProps) {
  function updateExperience(
    index: number,
    patch: Partial<ParsedExperience>,
  ) {
    const experiences = data.experiences.map((item, itemIndex) =>
      itemIndex === index ? { ...item, ...patch } : item,
    );
    onChange({ ...data, experiences });
  }

  function updateSkill(index: number, patch: Partial<ParsedSkill>) {
    const skills = data.skills.map((item, itemIndex) =>
      itemIndex === index ? { ...item, ...patch } : item,
    );
    onChange({ ...data, skills });
  }

  function updateEducation(
    index: number,
    patch: Partial<ParsedEducation>,
  ) {
    const educations = data.educations.map((item, itemIndex) =>
      itemIndex === index ? { ...item, ...patch } : item,
    );
    onChange({ ...data, educations });
  }

  return (
    <div className="mb-8 space-y-6">
      <EditableSection
        title="الخبرات"
        onAdd={() =>
          onChange({
            ...data,
            experiences: [
              ...data.experiences,
              {
                company: null,
                position: null,
                startDate: null,
                endDate: null,
                isCurrent: false,
                description: null,
                sourceText: 'إضافة يدوية',
              },
            ],
          })
        }
      >
        {data.experiences.length ? (
          data.experiences.map((item, index) => (
            <article
              key={`${item.sourceText}-${index}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="grid gap-3 md:grid-cols-2">
                <TextInput
                  label="المنصب"
                  value={item.position}
                  onChange={(value) =>
                    updateExperience(index, { position: value })
                  }
                />
                <TextInput
                  label="الشركة"
                  value={item.company}
                  onChange={(value) =>
                    updateExperience(index, { company: value })
                  }
                />
                <TextInput
                  label="تاريخ البداية"
                  value={item.startDate}
                  onChange={(value) =>
                    updateExperience(index, { startDate: value })
                  }
                />
                <TextInput
                  label="تاريخ النهاية"
                  value={item.endDate}
                  onChange={(value) =>
                    updateExperience(index, { endDate: value })
                  }
                />
                <label className="md:col-span-2">
                  <span className="mb-1 block text-[11px] font-bold text-slate-600">
                    الوصف
                  </span>
                  <textarea
                    rows={3}
                    value={item.description ?? ''}
                    onChange={(event) =>
                      updateExperience(index, {
                        description:
                          event.target.value.trim() || null,
                      })
                    }
                    className={inputClass}
                  />
                </label>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={item.isCurrent}
                    onChange={(event) =>
                      updateExperience(index, {
                        isCurrent: event.target.checked,
                        endDate: event.target.checked
                          ? null
                          : item.endDate,
                      })
                    }
                  />
                  أعمل هنا حاليًا
                </label>
                <RemoveButton
                  onClick={() =>
                    onChange({
                      ...data,
                      experiences: data.experiences.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    })
                  }
                />
              </div>
            </article>
          ))
        ) : (
          <EmptyState text="لم تُستخرج خبرات منظمة." />
        )}
      </EditableSection>

      <EditableSection
        title="المهارات"
        onAdd={() =>
          onChange({
            ...data,
            skills: [
              ...data.skills,
              { name: '', category: null, sourceText: 'إضافة يدوية' },
            ],
          })
        }
      >
        {data.skills.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {data.skills.map((item, index) => (
              <article
                key={`${item.sourceText}-${index}`}
                className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div className="grid flex-1 gap-2 sm:grid-cols-2">
                  <TextInput
                    label="المهارة"
                    value={item.name}
                    onChange={(value) =>
                      updateSkill(index, { name: value ?? '' })
                    }
                  />
                  <TextInput
                    label="التصنيف"
                    value={item.category}
                    onChange={(value) =>
                      updateSkill(index, { category: value })
                    }
                  />
                </div>
                <RemoveButton
                  onClick={() =>
                    onChange({
                      ...data,
                      skills: data.skills.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    })
                  }
                />
              </article>
            ))}
          </div>
        ) : (
          <EmptyState text="لم تُستخرج مهارات." />
        )}
      </EditableSection>

      <EditableSection
        title="المؤهلات التعليمية"
        onAdd={() =>
          onChange({
            ...data,
            educations: [
              ...data.educations,
              {
                institution: null,
                degree: null,
                fieldOfStudy: null,
                gpa: null,
                sourceText: 'إضافة يدوية',
              },
            ],
          })
        }
      >
        {data.educations.length ? (
          data.educations.map((item, index) => (
            <article
              key={`${item.sourceText}-${index}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="grid gap-3 md:grid-cols-2">
                <TextInput
                  label="الجهة التعليمية"
                  value={item.institution}
                  onChange={(value) =>
                    updateEducation(index, { institution: value })
                  }
                />
                <TextInput
                  label="الدرجة"
                  value={item.degree}
                  onChange={(value) =>
                    updateEducation(index, { degree: value })
                  }
                />
                <TextInput
                  label="التخصص"
                  value={item.fieldOfStudy}
                  onChange={(value) =>
                    updateEducation(index, { fieldOfStudy: value })
                  }
                />
                <TextInput
                  label="المعدل"
                  value={item.gpa}
                  onChange={(value) =>
                    updateEducation(index, { gpa: value })
                  }
                />
              </div>
              <div className="mt-3 flex justify-end">
                <RemoveButton
                  onClick={() =>
                    onChange({
                      ...data,
                      educations: data.educations.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    })
                  }
                />
              </div>
            </article>
          ))
        ) : (
          <EmptyState text="لم تُستخرج مؤهلات منظمة." />
        )}
      </EditableSection>
    </div>
  );
}

function EditableSection({
  title,
  onAdd,
  children,
}: {
  title: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-black text-emerald-900">{title}</h3>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-800"
        >
          إضافة
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <label>
      <span className="mb-1 block text-[11px] font-bold text-slate-600">
        {label}
      </span>
      <input
        value={value ?? ''}
        onChange={(event) =>
          onChange(event.target.value.trim() || null)
        }
        className={inputClass}
      />
    </label>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-black text-rose-700"
    >
      حذف
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-xl bg-slate-50 p-4 text-xs text-slate-400">
      {text}
    </p>
  );
}
