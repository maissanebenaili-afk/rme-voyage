import { describe, expect, it } from 'vitest';
import { parseArpOutput } from '../src/discovery/parser.js';

describe('parseArpOutput', () => {
  it('parses Linux net-tools format', () => {
    const raw = [
      'router.lan (192.168.1.1) at aa:bb:cc:dd:ee:01 [ether] on eth0',
      'laptop.lan (192.168.1.42) at aa:bb:cc:dd:ee:02 [ether] on eth0',
    ].join('\n');
    expect(parseArpOutput(raw)).toEqual([
      { ip: '192.168.1.1', mac: 'aa:bb:cc:dd:ee:01' },
      { ip: '192.168.1.42', mac: 'aa:bb:cc:dd:ee:02' },
    ]);
  });

  it('parses macOS BSD arp format', () => {
    const raw = '? (192.168.1.2) at aa:bb:cc:dd:ee:03 on en0 ifscope [ethernet]';
    expect(parseArpOutput(raw)).toEqual([{ ip: '192.168.1.2', mac: 'aa:bb:cc:dd:ee:03' }]);
  });

  it('parses Windows arp -a format and normalizes dashes to colons', () => {
    const raw = [
      'Interface: 192.168.1.10 --- 0x3',
      '  Internet Address      Physical Address      Type',
      '  192.168.1.1           aa-bb-cc-dd-ee-04     dynamic',
    ].join('\n');
    expect(parseArpOutput(raw)).toEqual([{ ip: '192.168.1.1', mac: 'aa:bb:cc:dd:ee:04' }]);
  });

  it('ignores unparsable lines and blank input', () => {
    expect(parseArpOutput('')).toEqual([]);
    expect(parseArpOutput('not an arp line\n---\n')).toEqual([]);
  });
});
