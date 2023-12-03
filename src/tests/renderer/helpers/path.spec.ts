import { generateRecordFileName, dirname, join } from "@/renderer/helpers/path";
import { RecordMetadata, RecordMetadataKey } from "electron-shogi-core";

describe("helpers/path", () => {
  it("dirname", async () => {
    expect(dirname("/home/user/foo/bar.baz")).toBe("/home/user/foo");
    expect(dirname("C:\\\\foo\\bar.baz")).toBe("C:\\\\foo");
    expect(dirname("file:///home/user/foo/bar.baz")).toBe("file:///home/user/foo");
  });

  it("join", async () => {
    expect(join("/home/user/foo", "bar/baz.qux")).toBe("/home/user/foo/bar/baz.qux");
    expect(join("/home/user/foo/", "/bar/baz.qux")).toBe("/home/user/foo/bar/baz.qux");
    expect(join("./foo/", "/bar/baz.qux")).toBe("./foo/bar/baz.qux");
    expect(join("C:\\\\Users\\foo\\", "\\bar\\baz.qux")).toBe("C:\\\\Users\\foo\\bar\\baz.qux");
  });

  it("generateRecordFileName/emptyMetadata", async () => {
    const meta = new RecordMetadata();
    expect(generateRecordFileName(meta)).toMatch(/^[0-9]{8}\.kif$/);
  });

  it("generateRecordFileName/withDate", async () => {
    const meta = new RecordMetadata();
    meta.setStandardMetadata(RecordMetadataKey.DATE, "2022/09/30");
    expect(generateRecordFileName(meta)).toBe("20220930.kif");
  });

  it("generateRecordFileName/withStartDateTime", async () => {
    const meta = new RecordMetadata();
    meta.setStandardMetadata(RecordMetadataKey.DATE, "2022/01/01");
    meta.setStandardMetadata(RecordMetadataKey.START_DATETIME, "2022/01/02 11:30");
    expect(generateRecordFileName(meta)).toBe("20220102_1130.kif");
  });

  it("generateRecordFileName/withTitle", async () => {
    const meta = new RecordMetadata();
    meta.setStandardMetadata(RecordMetadataKey.DATE, "2022/01/01");
    meta.setStandardMetadata(RecordMetadataKey.START_DATETIME, "2022/01/02 11:30");
    meta.setStandardMetadata(RecordMetadataKey.TITLE, "My New Game");
    expect(generateRecordFileName(meta)).toBe("20220102_1130_My New Game.kif");
  });

  it("generateRecordFileName/withTournament", async () => {
    const meta = new RecordMetadata();
    meta.setStandardMetadata(RecordMetadataKey.DATE, "2022/01/01");
    meta.setStandardMetadata(RecordMetadataKey.START_DATETIME, "2022/01/02 11:30");
    meta.setStandardMetadata(RecordMetadataKey.TOURNAMENT, "My Tournament");
    expect(generateRecordFileName(meta)).toBe("20220102_1130_My Tournament.kif");
  });

  it("generateRecordFileName/withPlayerName", async () => {
    const meta = new RecordMetadata();
    meta.setStandardMetadata(RecordMetadataKey.DATE, "2022/01/01");
    meta.setStandardMetadata(RecordMetadataKey.BLACK_NAME, "先手の人");
    meta.setStandardMetadata(RecordMetadataKey.WHITE_NAME, "後手の人");
    expect(generateRecordFileName(meta)).toBe("20220101_先手の人_後手の人.kif");
  });

  it("generateRecordFileName/withTitleAndPlayerName", async () => {
    const meta = new RecordMetadata();
    meta.setStandardMetadata(RecordMetadataKey.DATE, "2022/01/01");
    meta.setStandardMetadata(RecordMetadataKey.TITLE, "My New Game");
    meta.setStandardMetadata(RecordMetadataKey.BLACK_NAME, "先手の人");
    meta.setStandardMetadata(RecordMetadataKey.WHITE_NAME, "後手の人");
    expect(generateRecordFileName(meta)).toBe("20220101_My New Game_先手の人_後手の人.kif");
  });

  it("generateRecordFileName/escape", async () => {
    const meta = new RecordMetadata();
    meta.setStandardMetadata(RecordMetadataKey.DATE, "2022/01/01");
    meta.setStandardMetadata(RecordMetadataKey.BLACK_NAME, "Foo:Bar<Baz");
    meta.setStandardMetadata(RecordMetadataKey.WHITE_NAME, "Qux|Quux>Corge");
    expect(generateRecordFileName(meta)).toBe("20220101_Foo_Bar_Baz_Qux_Quux_Corge.kif");
  });

  it("generateRecordFileName/customTemplate", async () => {
    const meta = new RecordMetadata();
    meta.setStandardMetadata(RecordMetadataKey.DATE, "2022/01/01");
    meta.setStandardMetadata(RecordMetadataKey.TITLE, "My New Game");
    meta.setStandardMetadata(RecordMetadataKey.BLACK_NAME, "先手の人");
    meta.setStandardMetadata(RecordMetadataKey.WHITE_NAME, "後手の人");
    expect(
      generateRecordFileName(meta, "棋譜-{datetime}{_title}{_sente}{_gote}-{hex5}", ".csa"),
    ).toMatch(/^棋譜-20220101_My New Game_先手の人_後手の人-[0-9A-F]{5}\.csa$/);
    expect(generateRecordFileName(meta, "{title_}{sente_}{gote_}{hex5}", "jkf")).toMatch(
      /^My New Game_先手の人_後手の人_[0-9A-F]{5}\.jkf$/,
    );
  });
});
