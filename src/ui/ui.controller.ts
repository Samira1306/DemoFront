import { Controller, Get, Param, Res } from '@nestjs/common';
import { join } from 'node:path';
import { createReadStream } from 'node:fs';

@Controller('ui')
export class UiController {
  private readonly base = join(process.cwd(), 'src', 'ui', 'frontend');

  @Get()
  index(@Res() res: any) {
    const path = join(this.base, 'index.html');
    const stream = createReadStream(path);
    res.type('html');
    stream.pipe(res);
  }

  @Get('assets/:file')
  assets(@Param('file') file: string, @Res() res: any) {
    const path = join(this.base, file);
    // basic content type inference
    if (file.endsWith('.js')) res.type('application/javascript');
    else if (file.endsWith('.css')) res.type('text/css');
    else if (file.endsWith('.html')) res.type('text/html');
    else if (file.endsWith('.png')) res.type('image/png');
    else if (file.endsWith('.jpg') || file.endsWith('.jpeg')) res.type('image/jpeg');
    const stream = createReadStream(path);
    stream.pipe(res);
  }
}
