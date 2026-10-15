import { isDefined } from 'twenty-shared/utils';
import { sortByProperty } from '~/utils/array/sortByProperty';

export type RecordWithPosition = {
  id: string;
  position: number;
};

/** Compute a fractional position between neighbours without mutating records. */
export const computeNewPositionOfDraggedRecord = ({
  arrayOfRecordsWithPosition,
  idOfItemToMove,
  idOfTargetItem,
  isDroppedAfterList,
}: {
  arrayOfRecordsWithPosition: RecordWithPosition[];
  idOfItemToMove: string;
  idOfTargetItem: string;
  isDroppedAfterList: boolean;
}) => {
  const targetItem = arrayOfRecordsWithPosition.find(
    (recordToFind) => recordToFind.id === idOfTargetItem,
  );

  if (!isDefined(targetItem)) {
    throw new Error(`Cannot find item to move for id : ${idOfTargetItem}`);
  }

  if (idOfItemToMove === idOfTargetItem) {
    return targetItem.position;
  }

  const targetPosition = targetItem.position;

  if (isDroppedAfterList) {
    return targetPosition + 1;
  }

  const sortedRecordsByAscendingPosition = arrayOfRecordsWithPosition.toSorted(
    sortByProperty('position'),
  );

  const indexOfItemToMove = sortedRecordsByAscendingPosition.findIndex(
    (recordToFind) => recordToFind.id === idOfItemToMove,
  );

  const itemToMoveIsNotInTable = indexOfItemToMove === -1;

  const indexOfTargetItem = sortedRecordsByAscendingPosition.findIndex(
    (recordToFind) => recordToFind.id === idOfTargetItem,
  );

  if (indexOfTargetItem === 0) {
    return targetPosition - 1;
  }

  // An incoming record is inserted before the target. A record already in the
  // table lands after the target only when it is dragged down from above it.
  const shouldGoAfterTargetItem =
    !itemToMoveIsNotInTable && indexOfItemToMove < indexOfTargetItem;

  if (shouldGoAfterTargetItem) {
    const nextRecord = sortedRecordsByAscendingPosition[indexOfTargetItem + 1];

    if (!isDefined(nextRecord)) {
      return targetPosition + 1;
    }

    return targetPosition + (nextRecord.position - targetPosition) / 2;
  }

  const previousRecord =
    sortedRecordsByAscendingPosition[indexOfTargetItem - 1];

  if (!isDefined(previousRecord)) {
    return targetPosition - 1;
  }

  return targetPosition - (targetPosition - previousRecord.position) / 2;
};
