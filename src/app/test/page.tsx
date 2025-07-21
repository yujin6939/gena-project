"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function TestPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Shadcn UI 테스트</h1>
      <Card>
        <CardContent className="p-4 space-y-4">
          <Input placeholder="입력해보세요" />
          <Button>버튼 테스트</Button>
        </CardContent>
      </Card>
    </div>
  );
}
