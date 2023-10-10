import Explorer from "@/types/Explorer"
import Hive from "@/types/Hive";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Dialog } from "../ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import OperationTypesDialog from "../block/OperationTypesDialog";
import { Button } from "../ui/button";
import Link from "next/link";
import { Select, SelectContent, SelectTrigger, SelectItem } from "../ui/select";
import { Loader2, X } from "lucide-react";


interface BlockSearchSectionProps {
  getBlockDataForSearch: (blockSearchProps: Explorer.BlockSearchProps) => void;
  getOperationKeys: (operationId: number | null, nextKey?: string) => void;
  operationsTypes: Hive.OperationTypes[];
  foundBlocksIds: number[] | null;
  currentOperationKeys: string[] | null;
  operationKeysChain: string[] | null;
  loading: boolean;
}


const BlockSearchSection: React.FC<BlockSearchSectionProps> = ({
  getBlockDataForSearch, 
  getOperationKeys, 
  operationsTypes, 
  foundBlocksIds, 
  currentOperationKeys, 
  operationKeysChain,
  loading
}) => {

  const [accountName, setAccountName] = useState<string | null>(null);
  const [fromBlock, setFromBlock] = useState<number | null>(null);
  const [toBlock, setToBlock] = useState<number | null>(null);
  const [selectedOperationTypes, setSelectedOperationTypes] = useState<number[]>([]);
  const [fieldContent, setFieldContent] = useState<string | null>(null);

  const startSearch = () => {
    const blockSearchProps: Explorer.BlockSearchProps = {
      accountName,
      operations: selectedOperationTypes,
      fromBlock,
      toBlock,
      limit: 100,
      deepProps: {
        keys: operationKeysChain,
        content: fieldContent
      }
    }
    getBlockDataForSearch(blockSearchProps);
  }

  const changeSelectedOperationTypes = (operationIds: number[]) => {
    if (operationIds.length === 1) {
      getOperationKeys(operationIds[0]);
    } else {
      getOperationKeys(null);
    }
    return setSelectedOperationTypes(operationIds);
  }

  const onSelect = (newValue: string) => {
    getOperationKeys(selectedOperationTypes[0], newValue)
  }

  const getOperationButtonTitle = (): string => {
    if (selectedOperationTypes && selectedOperationTypes.length === 1) return operationsTypes[selectedOperationTypes[0]][1]
    if (selectedOperationTypes && selectedOperationTypes.length > 1) return `${selectedOperationTypes.length} operations`
    return "Operations"
  }

  return(
    <div className='mt-6 col-start-1 col-span-4 md:col-span-1 '>
      <div className=' bg-explorer-dark-gray p-2 rounded-["6px] md:mx-6 h-fit rounded'>
      <div className="text-center text-xl text-explorer-orange">Block Search</div>
        <div className="flex items-center m-2">
          <OperationTypesDialog operationTypes={operationsTypes} setSelectedOperations={changeSelectedOperationTypes} triggerTitle={getOperationButtonTitle()} />   
        </div>
        <div className="flex items-center m-2">      
          <Input
            className="w-1/2"
            type="text"
            value={accountName || ""}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Account"
          />
        </div>
        <div className="flex items-center  m-2">
          <Input
            className="w-1/2"
            type="number"
            value={fromBlock || ""}
            onChange={(e) => setFromBlock(Number(e.target.value))}
            placeholder="From"
          />
          <Input
            className="w-1/2"
            type="number"
            value={toBlock || ""}
            onChange={(e) => setToBlock(Number(e.target.value))}
            placeholder="To"
          />
        </div>
        <div className="flex items-center  m-2">

        </div>
        {currentOperationKeys &&   
          <>
            <div className="flex items-center  m-2">

              <Select onValueChange={onSelect}>
                <SelectTrigger className="text-blocked" >
                  {(operationKeysChain && !!operationKeysChain.length) ? operationKeysChain.map((key) => (
                  <div key={key} className={"mx-1 text-blocked"}>{key}</div>
                  )) : (
                    <div>Pick a key</div>
                  )}
                </SelectTrigger>
                <SelectContent className="bg-white text-black rounded-[2px]">
                  {currentOperationKeys.map((opKey) => (
                    <SelectItem className="m-1 text-center" key={opKey} value={opKey}>{opKey}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <X onClick={() => getOperationKeys(selectedOperationTypes[0])} height={30} width={30} />   
            </div>
            <div className="flex items-center  m-2">
              <Input
                className="w-1/2"
                type="text"
                value={fieldContent || ""}
                onChange={(e) => setFieldContent(e.target.value)}
                placeholder="Content"
              />     
            </div>
          </>  
        }
        <div className="flex items-center  m-2">
          <Button className=" bg-blue-800 hover:bg-blue-600 rounded-[4px]" onClick={startSearch} disabled={!selectedOperationTypes.length}>
            <span>Search</span> {loading && <Loader2 className="animate-spin mt-1 h-4 w-4 ml-3 ..." />}
          </Button>
          {!selectedOperationTypes.length && <label className="ml-2 text-muted-foreground">Pick at least 1 operation type</label>}
        </div>
      </div>
      {foundBlocksIds && (
        <div className=' bg-explorer-dark-gray p-2 rounded-["6px] md:mx-6 h-fit rounded mt-4'>
          <div className="text-center">Results:</div>
          <div className="flex flex-wrap">
            {foundBlocksIds.map((blockId) => (
              <Link key={blockId} href={`block/${blockId}`}>

                <div className="m-1 border border-solid p-1" >{blockId}</div>
              </Link>
            ))}
          </div>
          
        </div>
      )}
    </div>
  )        
}

export default BlockSearchSection