import { DataSourceApi } from '@grafana/data';
import { getDataSourceSrv } from '@grafana/runtime';

// Hack to set variables in Grafana dynamically - not supported
const setGrafanaVariable = (name: string, value: string) => {
  let dataSource: DataSourceApi = (getDataSourceSrv() as unknown) as DataSourceApi;
  // Not supported
  // @ts-ignore
  let variable = _.find(dataSource.templateSrv.variables, { name: name });
  variable.query = value;
  variable.variableSrv.updateOptions(variable).then(() => {
    variable.variableSrv.variableUpdated(variable, true);
  });
};

export { setGrafanaVariable }