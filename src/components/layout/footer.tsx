import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="font-bold text-xl">GEO-Pulse</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI 검색 가시성 및 종합 SEO 진단 솔루션
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">제품</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#features" className="hover:text-foreground">
                  기능
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  가격
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">리소스</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground">
                  블로그
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  가이드
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">법적 고지</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  이용약관
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} GEO-Pulse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
