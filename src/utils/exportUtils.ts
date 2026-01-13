export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToJSON = (data: any, filename: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const prepareIssuesForExport = (issues: any[]) => {
  return issues.map((issue) => ({
    Title: issue.title,
    Tool: issue.tool,
    Severity: issue.severity,
    Status: issue.status,
    'Assigned To': issue.assigned_to || 'Unassigned',
    'Detected At': new Date(issue.detected_at).toLocaleString(),
    'Resolved At': issue.resolved_at ? new Date(issue.resolved_at).toLocaleString() : 'N/A',
  }));
};

export const prepareActivityLogsForExport = (logs: any[]) => {
  return logs.map((log) => ({
    Action: log.action_type,
    'Entity Type': log.entity_type,
    User: log.profiles?.full_name || 'System',
    Timestamp: new Date(log.created_at).toLocaleString(),
    Details: JSON.stringify(log.details),
  }));
};
