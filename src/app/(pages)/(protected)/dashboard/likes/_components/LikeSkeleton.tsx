import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead className="w-[150px]">Product</TableHead>
            <TableHead>Image</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(3)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>
                <div className="h-4 w-24 bg-gray-300 rounded" />
              </TableCell>
              <TableCell>
                <div className="h-16 w-24 bg-gray-300 rounded" />
              </TableCell>
              <TableCell className="text-right space-x-2">
                <div className="inline-block h-8 w-16 bg-gray-300 rounded" />
                <div className="inline-block h-8 w-16 bg-gray-300 rounded" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
