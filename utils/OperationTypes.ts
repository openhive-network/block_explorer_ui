import Explorer from "@/types/Explorer";

type OperationTypeCatalog = Explorer.ExtendedOperationTypePattern[] | undefined;

export const opTypeIdsByName = (
  catalog: OperationTypeCatalog,
  names: Iterable<string>
): number[] => {
  const wanted = names instanceof Set ? names : new Set(names);
  const ids: number[] = [];
  catalog?.forEach((op) => {
    if (wanted.has(op.operation_name)) ids.push(op.op_type_id);
  });
  return ids;
};

export const opTypeIdByName = (
  catalog: OperationTypeCatalog,
  name: string
): number | undefined =>
  catalog?.find((op) => op.operation_name === name)?.op_type_id;
