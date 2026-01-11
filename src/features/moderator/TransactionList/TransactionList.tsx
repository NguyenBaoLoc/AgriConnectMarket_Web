import { Card, CardHeader, CardTitle } from '../../../components/ui/card';

export function TransactionList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Management</CardTitle>
      </CardHeader>
      <div className="p-6">
        <p className="text-gray-600">
          Transaction management feature for moderators will be implemented
          here.
        </p>
      </div>
    </Card>
  );
}
