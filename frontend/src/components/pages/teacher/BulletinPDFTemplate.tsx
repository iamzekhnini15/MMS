import React from 'react';
import { DetailedStudentBulletin } from '../../../contexts/StudentBulletinContext';

interface BulletinPDFTemplateProps {
  bulletinData: DetailedStudentBulletin;
}

const BulletinPDFTemplate: React.FC<BulletinPDFTemplateProps> = ({ bulletinData }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 80) return '#16a34a';
    if (grade >= 60) return '#f97316';
    return '#dc2626';
  };

  return (
    <div id="bulletin-pdf-content" className="pdf-container">
      <style dangerouslySetInnerHTML={{
        __html: `
          .pdf-container {
            font-family: 'Helvetica Neue', sans-serif;
            max-width: 210mm;
            margin: auto;
            padding: 40px;
            background: white;
            color: #1a1a1a;
            font-size: 12px;
            line-height: 1.6;
          }

          .title {
            text-align: center;
            font-size: 28px;
            font-weight: 300;
            margin-bottom: 4px;
          }

          .subtitle {
            text-align: center;
            font-size: 13px;
            color: #888;
            margin-bottom: 40px;
          }

          .section {
            margin-bottom: 30px;
          }

          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .info-label {
            font-size: 11px;
            text-transform: uppercase;
            color: #555;
            margin-bottom: 4px;
          }

          .info-value {
            font-size: 14px;
            font-weight: 500;
            color: #1a1a1a;
          }

          .stat-block {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }

          .stat {
            text-align: center;
            flex: 1;
          }

          .stat-value {
            font-size: 20px;
            font-weight: 500;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 11px;
            color: #888;
          }

          .subject {
            margin-bottom: 24px;
            page-break-inside: avoid;
          }

          .subject-header {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 6px;
          }

          .subject-details {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #555;
            margin-bottom: 8px;
          }

          .grade {
            font-size: 14px;
            font-weight: 600;
          }

          .evaluation {
            border-top: 1px solid #eee;
            padding-top: 6px;
            margin-top: 6px;
          }

          .evaluation-title {
            font-weight: 500;
            margin-bottom: 2px;
          }

          .comment {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }

          .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 10px;
            color: #888;
          }
        `
      }} />

      <div className="title">Bulletin Scolaire</div>
      <div className="subtitle">{bulletinData.periodName} • {bulletinData.academicYear}</div>

      <div className="section info-grid">
        <div>
          <div className="info-label">Élève</div>
          <div className="info-value">{bulletinData.studentName}</div>
        </div>
        <div>
          <div className="info-label">Classe</div>
          <div className="info-value">{bulletinData.className}</div>
        </div>
        <div>
          <div className="info-label">Date</div>
          <div className="info-value">{formatDate(bulletinData.generatedAt)}</div>
        </div>
        <div>
          <div className="info-label">Effectif</div>
          <div className="info-value">{bulletinData.totalStudents} élèves</div>
        </div>
      </div>

      <div className="section stat-block">
        <div className="stat">
          <div className="stat-value" style={{ color: getGradeColor(bulletinData.generalAverage) }}>{bulletinData.generalAverage.toFixed(1)}%</div>
          <div className="stat-label">Moyenne Générale</div>
        </div>
        <div className="stat">
          <div className="stat-value">{bulletinData.classRank}ᵉ</div>
          <div className="stat-label">Rang</div>
        </div>
        <div className="stat">
          <div className="stat-value">{bulletinData.classAverage.toFixed(1)}%</div>
          <div className="stat-label">Moyenne Classe</div>
        </div>
      </div>

      <div className="section">
        {bulletinData.subjectGrades.map((subject, index) => (
          <div key={index} className="subject">
            <div className="subject-header">{subject.subjectName}</div>
            <div className="subject-details">
              <span>Coefficient: {subject.coefficient}</span>
              <span>Évaluations: {subject.evaluationGrades.length}</span>
              <span className="grade" style={{ color: getGradeColor(subject.average) }}>{subject.average.toFixed(1)}%</span>
            </div>

            {subject.evaluationGrades.map((evaluation, i) => (
              <div key={i} className="evaluation">
                <div className="evaluation-title">{evaluation.evaluationTitle}</div>
                <div style={{ fontSize: '10px', color: '#666' }}>{formatDate(evaluation.gradedAt)} • {evaluation.gradedByName}</div>
                {evaluation.comment && (
                  <div style={{ fontSize: '10px', fontStyle: 'italic', color: '#888' }}>
                    "{evaluation.comment}"
                  </div>
                )}
                <div className="grade" style={{ color: getGradeColor(evaluation.percentage) }}>
                  {evaluation.score.toFixed(1)} / {evaluation.maxScore} • {evaluation.percentage.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {bulletinData.generalComment && (
        <div className="comment">
          <div className="info-label">Commentaire Général</div>
          <div>{bulletinData.generalComment}</div>
        </div>
      )}

      <div className="footer">
        Généré le {formatDate(new Date().toISOString())} • Système de Gestion Scolaire
      </div>
    </div>
  );
};

export default BulletinPDFTemplate;
